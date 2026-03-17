import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { S3Driver } from 'src/engine/core-modules/file-storage/drivers/s3.driver';

const execAsync = promisify(exec);

@Injectable()
export class DatabaseBackupService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseBackupService.name);
  private s3Driver: S3Driver | null = null;
  private readonly CRON_JOB_NAME = 'database-backup-cron-job';

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    this.initializeS3Driver();
  }

  onModuleInit() {
    this.rescheduleCron();
  }

  private initializeS3Driver() {
    const s3Name = process.env.DATABASE_BACKUP_S3_NAME;
    const s3Region = process.env.DATABASE_BACKUP_S3_REGION;
    const s3Endpoint = process.env.DATABASE_BACKUP_S3_ENDPOINT;
    const s3AccessKey = process.env.DATABASE_BACKUP_S3_ACCESS_KEY_ID;
    const s3SecretKey = process.env.DATABASE_BACKUP_S3_SECRET_ACCESS_KEY;
    
    if (s3Name && s3AccessKey && s3SecretKey) {
      this.s3Driver = new S3Driver({
        bucketName: s3Name as string,
        region: (s3Region as string) || 'auto',
        endpoint: s3Endpoint as string,
        credentials: {
          accessKeyId: s3AccessKey as string,
          secretAccessKey: s3SecretKey as string,
        },
      });
    } else {
      this.s3Driver = null;
    }
  }

  private reloadEnv() {
    this.logger.log('Reloading environment variables and re-initializing S3 driver.');
    
    let envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
      envPath = path.join(process.cwd(), 'packages/twenty-server', '.env');
    }

    if (fs.existsSync(envPath)) {
      this.logger.log(`Loading .env from: ${envPath}`);
      dotenv.config({ path: envPath, override: true });
    } else {
      this.logger.warn(`Could not find .env file at ${path.join(process.cwd(), '.env')} or ${envPath}`);
    }

    this.initializeS3Driver();
  }

  async createBackup(): Promise<string> {
    this.reloadEnv();
    
    const backupDir = path.join(process.cwd(), 'temp-backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    const dbUrl = process.env.PG_DATABASE_URL;
    
    if (!dbUrl) {
        throw new Error('PG_DATABASE_URL is not defined');
    }

    this.logger.log(`Starting database backup to ${filePath}...`);

    try {
      // Use --no-owner and --no-privileges for easier restore in different environments
      // Use --clean and --if-exists to ensure old objects are dropped before recreating them
      const dumpCommand = `/opt/homebrew/Cellar/libpq/18.3/bin/pg_dump --no-owner --no-privileges --clean --if-exists "${dbUrl}" > "${filePath}"`;
      await execAsync(dumpCommand);
      
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        throw new Error('Backup file is empty (0 bytes)');
      }

      this.logger.log(`Backup created successfully at ${filePath} (${stats.size} bytes)`);
      
      await this.uploadToCloud(filePath, fileName);
      
      // Clean up local file
      fs.unlinkSync(filePath);
      
      return fileName;
    } catch (error) {
      this.logger.error(`Failed to create backup: ${error.message}`);
      throw error;
    }
  }

  private async uploadToCloud(localPath: string, fileName: string): Promise<void> {
    if (!this.s3Driver) {
      this.logger.warn('S3 driver not configured for upload, skipping cloud upload. Ensure all S3 settings are provided in .env');
      return;
    }

    const fileContent = fs.readFileSync(localPath);
    
    this.logger.log(`Uploading backup ${fileName} to cloud storage...`);
    
    try {
      await this.s3Driver.writeFile({
        filePath: `backups/${fileName}`,
        sourceFile: fileContent,
        mimeType: 'application/sql',
      });
      this.logger.log(`Backup ${fileName} uploaded successfully`);
    } catch (error) {
      this.logger.error(`Failed to upload backup to cloud: ${error.message}`);
      throw error;
    }
  }

  async restoreBackup(fileName: string): Promise<void> {
    this.reloadEnv();

    if (!this.s3Driver) {
        throw new Error('S3 driver not configured');
    }

    const backupDir = path.join(process.cwd(), 'temp-backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const localPath = path.join(backupDir, fileName);
    const dbUrl = process.env.PG_DATABASE_URL;

    if (!dbUrl) {
        throw new Error('PG_DATABASE_URL is not defined');
    }

    this.logger.log(`Starting database restore from ${fileName}...`);

    try {
      await this.s3Driver.downloadFile({
        onStoragePath: `backups/${fileName}`,
        localPath: localPath,
      });

      if (!fs.existsSync(localPath) || fs.statSync(localPath).size === 0) {
        throw new Error('Downloaded backup file is missing or empty');
      }

      // Capture stdout and stderr for better debugging
      const restoreCommand = `/opt/homebrew/Cellar/libpq/18.3/bin/psql "${dbUrl}" -f "${localPath}"`;
      this.logger.log(`Executing restore command: ${restoreCommand}`);
      
      const { stdout, stderr } = await execAsync(restoreCommand);
      
      if (stdout) this.logger.log(`Psql output: ${stdout}`);
      if (stderr) this.logger.warn(`Psql stderr: ${stderr}`);

      this.logger.log(`Database restored successfully from ${fileName}`);
      
      // Clean up local file
      fs.unlinkSync(localPath);
    } catch (error) {
      if (error.stderr) {
        this.logger.error(`Psql restore failed with stderr: ${error.stderr}`);
      }
      this.logger.error(`Failed to restore backup: ${error.message}`);
      throw error;
    }
  }

  getSettings() {
    this.reloadEnv();
    return {
      enabled: process.env.DATABASE_BACKUP_ENABLED === 'true',
      cronSchedule: process.env.DATABASE_BACKUP_CRON || '0 0 * * *',
      bucketName: process.env.DATABASE_BACKUP_S3_NAME || '',
      region: process.env.DATABASE_BACKUP_S3_REGION || '',
      endpoint: process.env.DATABASE_BACKUP_S3_ENDPOINT || '',
      accessKeyId: process.env.DATABASE_BACKUP_S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.DATABASE_BACKUP_S3_SECRET_ACCESS_KEY || '',
    };
  }

  async testConnection(): Promise<boolean> {
    this.reloadEnv();

    if (!this.s3Driver) {
      this.logger.warn('S3 driver not configured for test connection');
      return false;
    }

    try {
      // We use createBucket or checkBucketExists to verify connection
      // For R2, headBucket is usually enough to verify credentials and bucket existence
      await this.s3Driver.client.headBucket({
        Bucket: process.env.DATABASE_BACKUP_S3_NAME as string,
      });
      return true;
    } catch (error) {
      this.logger.error(`Connection test failed: ${error.message}`);
      return false;
    }
  }

  async listBackups(): Promise<string[]> {
    this.reloadEnv();

    if (!this.s3Driver) {
      this.logger.warn('S3 driver not configured, cannot list backups');
      return [];
    }

    try {
      const bucket = process.env.DATABASE_BACKUP_S3_NAME as string;
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: 'backups/',
      });

      const response = (await this.s3Driver.client.send(
        command,
      )) as ListObjectsV2CommandOutput;

      const contents = response.Contents || [];

      return contents
        .map((obj) => obj.Key?.replace('backups/', '') || '')
        .filter((key) => key !== '' && key.endsWith('.sql'))
        .sort((a, b) => b.localeCompare(a));
    } catch (error) {
      this.logger.error(`Failed to list backups: ${error.message}`);
      return [];
    }
  }

  rescheduleCron() {
    this.reloadEnv();
    const enabled = process.env.DATABASE_BACKUP_ENABLED === 'true';
    const cronSchedule = process.env.DATABASE_BACKUP_CRON || '0 0 * * *';

    // Remove existing job if it exists
    try {
      this.schedulerRegistry.deleteCronJob(this.CRON_JOB_NAME);
      this.logger.log(`Deleted existing cron job: ${this.CRON_JOB_NAME}`);
    } catch (e) {
      // Job doesn't exist, ignore
    }

    if (enabled) {
      try {
        const job = new CronJob(cronSchedule, async () => {
          this.logger.log(`Executing scheduled database backup (Cron: ${cronSchedule})...`);
          try {
            await this.createBackup();
          } catch (error) {
            this.logger.error('Scheduled database backup failed', error);
          }
        });

        this.schedulerRegistry.addCronJob(this.CRON_JOB_NAME, job);
        job.start();
        this.logger.log(`Scheduled new cron job: ${this.CRON_JOB_NAME} with schedule: ${cronSchedule}`);
      } catch (error) {
        this.logger.error(`Failed to schedule cron job: ${error.message}`);
      }
    } else {
      this.logger.log('Automatic backups are disabled, skipping cron scheduling');
    }
  }
}
