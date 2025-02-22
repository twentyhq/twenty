import { Controller, Get } from '@nestjs/common';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Controller('reset')
export class ResetController {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Get()
  async reset() {
    try {
      // Get a datasource for a specific workspace
      const dataSource = await this.twentyORMGlobalManager.getDataSourceForWorkspace('3b8e6458-5fc1-4e63-8563-008ccddaa6db');
      
      const result = await dataSource.query('SELECT * FROM workspace_1wgvd1injqtife6y4rvfbu3h5.person');
      console.log(result);

      return { 
        message: 'Database reset successful',
        queryResult: result 
      };
    } catch (error) {
      throw error;
    }
  }
} 