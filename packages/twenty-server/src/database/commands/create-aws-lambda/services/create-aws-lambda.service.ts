/* eslint-disable no-useless-catch */
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

import AWS from 'aws-sdk';

const SKELETON_PATH =
  '../../../../../../../twenty-code-runner/lambda-nest-skeleton';

const FUNCTION_NAME = 'twenty-lambda-function';

export class CreateAWSLambdaService {
  async handle(userScript) {
    const tempDir = this.createTempFolder();

    try {
      // Copy the NestJS skeleton
      const skeletonDir = path.join(__dirname, SKELETON_PATH);
      const destDir = path.join(tempDir, 'nest-app');

      this.copyRecursiveSync(skeletonDir, destDir);

      // TODO: Fix that part
      // Copy the user script
      // this.copyUserScript(destDir, userScript);

      // Change to the destination directory
      process.chdir(destDir);

      // Install dependencies - compile TypeScript - zip folder
      execSync('yarn install');
      execSync('yarn tsc', { stdio: 'inherit' });
      execSync('zip -r lambda.zip dist node_modules');

      const lambda = new AWS.Lambda({
        region: 'eu-west-2',
      });

      const params = {
        Code: {
          ZipFile: fs.readFileSync('lambda.zip'),
        },
        FunctionName: FUNCTION_NAME,
        Handler: 'dist/lambda.handler',
        Role: 'arn:aws:iam::255840220362:role/service-role/test-role-y4guvbs0',
        Runtime: 'nodejs18.x',
        Description: 'Lambda function to run user script with NestJS',
        Timeout: 15,
      };

      await lambda.createFunction(params).promise();
      console.log(`Lambda function ${FUNCTION_NAME} created successfully!`);
      this.deleteFolderRecursive(tempDir);
    } catch (error) {
      this.deleteFolderRecursive(tempDir);
      throw error;
    }
  }

  private copyUserScript(destDir, userScript) {
    const scriptDir = path.join(destDir, 'src', 'my-custom', 'services');

    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir, { recursive: true });
    }
    fs.writeFileSync(path.join(scriptDir, 'my-custom.service.ts'), userScript);
  }

  private createTempFolder() {
    const tempDir = path.join(__dirname, 'temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    return tempDir;
  }

  private copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
      fs.mkdirSync(dest);
      fs.readdirSync(src).forEach((childItemName) => {
        this.copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName),
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  private deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach((file, _) => {
        const curPath = path.join(directoryPath, file);

        if (fs.lstatSync(curPath).isDirectory()) {
          this.deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(directoryPath);
    }
  }
}
