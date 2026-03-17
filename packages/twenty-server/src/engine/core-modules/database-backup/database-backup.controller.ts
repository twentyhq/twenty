import { Controller, Get, Post, Patch, Body, Logger } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { DatabaseBackupService } from './database-backup.service';

@Controller('database-backup')
export class DatabaseBackupController {
  private readonly logger = new Logger(DatabaseBackupController.name);

  constructor(private readonly databaseBackupService: DatabaseBackupService) {}

  @Get('settings')
  async getSettings() {
    this.logger.log('Fetching database backup settings...');
    return this.databaseBackupService.getSettings();
  }

  @Get('list')
  async listBackups() {
    this.logger.log('Fetching list of available backups...');
    return this.databaseBackupService.listBackups();
  }

  @Patch('settings')
  async updateSettings(@Body() settings: any) {
    this.logger.log('Updating database backup settings...');
    
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      const settingsMap = {
        'DATABASE_BACKUP_ENABLED': settings.enabled,
        'DATABASE_BACKUP_CRON': settings.cronSchedule,
        'DATABASE_BACKUP_S3_NAME': settings.bucketName,
        'DATABASE_BACKUP_S3_REGION': settings.region,
        'DATABASE_BACKUP_S3_ENDPOINT': settings.endpoint,
        'DATABASE_BACKUP_S3_ACCESS_KEY_ID': settings.accessKeyId,
        'DATABASE_BACKUP_S3_SECRET_ACCESS_KEY': settings.secretAccessKey,
      };

      for (const [key, value] of Object.entries(settingsMap)) {
        const regex = new RegExp(`^${key}=.*`, 'm');
        const escapedValue = String(value).replace(/\$/g, '$$$$');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${escapedValue}`);
        } else {
          envContent += `\n${key}=${escapedValue}`;
        }
      }

      fs.writeFileSync(envPath, envContent);
      this.logger.log('Database backup settings persisted to .env');
      
      this.databaseBackupService.rescheduleCron();
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to save settings: ${error.message}`);
      throw error;
    }
  }

  @Post('restore')
  async triggerRestore(@Body('fileName') fileName: string) {
    this.logger.log(`Triggering restore from ${fileName}...`);
    await this.databaseBackupService.restoreBackup(fileName);
    return { success: true };
  }

  @Post('trigger')
  async triggerBackup() {
    this.logger.log('Manually triggering database backup...');
    const fileName = await this.databaseBackupService.createBackup();
    return { success: true, fileName };
  }

  @Post('test-connection')
  async testConnection() {
    this.logger.log('Testing cloud storage connection...');
    const success = await this.databaseBackupService.testConnection();
    return { success };
  }
}
