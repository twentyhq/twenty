// jobCreationService.ts

import axios from 'axios';
import mongoose from 'mongoose';

import { GoogleSheetsService } from 'src/engine/core-modules/google-sheets/google-sheets.service';


interface JobCreationResponse {
  jobId: string;
  arxenaJobId: string;
  arxenaResponse: any;
  candidatesResponse: any;
  googleSheetId: string;
  googleSheetUrl: string;
}

console.log("This is the process.env.SERVER_BASE_URL::", process.env.SERVER_BASE_URL)

export class JobCreationService {
  private apiToken: string;
  private baseUrl: string;
  
  private sheetsService: GoogleSheetsService;


  constructor(apiToken: string,    
    sheetsService: GoogleSheetsService,
    baseUrl: string = process.env.SERVER_BASE_URL || 'http://app.arxena.com') 
  {
    this.apiToken = apiToken;
    this.baseUrl = baseUrl;
    this.sheetsService = sheetsService;
  }

  private async createSpreadsheetForJob(jobName: string, auth: any): Promise<any> {
    const spreadsheetTitle = `${jobName} - Job Tracking`;
    const spreadsheet = await this.sheetsService.createSpreadsheet(auth, spreadsheetTitle);
    
    // Initialize the spreadsheet with headers
    const headers = [
      ['Candidate Name', 'Email', 'Phone', 'Current Company', 'Current Title', 'Status', 'Notes']
    ];
    
    if (spreadsheet?.spreadsheetId) {
      await this.sheetsService.updateValues(
        auth,
        spreadsheet?.spreadsheetId,
        'Sheet1!A1:G1',
        headers
      );
    } else {
      throw new Error('Spreadsheet ID is undefined');
    }

    return {
      googleSheetId: spreadsheet.spreadsheetId,
      googleSheetUrl: spreadsheet.spreadsheetUrl
    };
  }



  private async createNewJob(jobName: string): Promise<string> {
    const response = await axios.request({
      method: 'post',
      url: `${this.baseUrl}/graphql`,
      headers: {
        'authorization': `Bearer ${this.apiToken}`,
        'content-type': 'application/json',
      },
      data: {
        operationName: "CreateOneJob",
        variables: {
          input: {
            id: '7bf69cfb-19ad-42d8-935d-b552341cfb6a',
            name: jobName,
            position: "first"
          }
        },
        query: `mutation CreateOneJob($input: JobCreateInput!) {
          createJob(data: $input) {
            id
            name
            position
          }
        }`
      }
    });

    console.log("This is the response from createNewJob::", response.data); // This is the response from createNewJob:: { data: { createJob: { id: '7bf69cfb-19ad-42d8-935d-b552341cfb6a', name: 'Test Job', position: 'first' } } }
    if (!response.data?.data.createJob?.id) {
      console.log('Failed to create job: No job ID received');
    }

    return response.data.data.createJob.id;
  }

  private async createJobInArxena(jobName: string, newJobId: string, jobId: string): Promise<any> {
    const response = await axios.request({
      method: 'post',
      url: `${this.baseUrl}/candidate-sourcing/create-job-in-arxena`,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        job_name: jobName,
        new_job_id: newJobId,
        id_to_update: jobId
      }
    });

    return response.data;
  }

  private async postCandidates(candidatesData: any): Promise<any> {
    const response = await axios.request({
      method: 'post',
      url: `${this.baseUrl}/candidate-sourcing/post-candidates`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`
      },
      data: candidatesData
    });
    console.log("This is the response from post-candidates::", response.data);

    return response.data;
  }

  public async executeJobCreationFlow(
    jobName: string, 
    candidatesData: any,
    twentyToken: string
  ): Promise<JobCreationResponse | undefined> {
    try {
      // Create new job
      const auth = await this.sheetsService.loadSavedCredentialsIfExist(twentyToken);
      if (!auth) {
        throw new Error('Failed to load Google credentials');
      }

      const jobId = await this.createNewJob(jobName);
      console.log("This is the jobId::", jobId);

      const { googleSheetId, googleSheetUrl } = await this.createSpreadsheetForJob(jobName, auth);

      // Generate new Arxena job ID
      const arxenaJobId = '64b29dbdf9822851831e4de9'


      // Create job in Arxena
      const arxenaResponse = await this.createJobInArxena(
        jobName,
        arxenaJobId,
        jobId
      );
      const candidateDataObj = JSON.stringify({
        "data": candidatesData,
        "job_id": arxenaJobId,     // Changed from jobId to job_id
        "job_name": jobName        // Changed from jobName to job_name
      });
        // Post candidates
      const candidatesResponse = await this.postCandidates(candidateDataObj);
      if (Array.isArray(candidatesData)) {
        const candidateRows = candidatesData.map(candidate => [
          candidate.name || '',
          candidate.email || '',
          candidate.phone || '',
          candidate.currentCompany || '',
          candidate.currentTitle || '',
          'New',
          ''
        ]);

        await this.sheetsService.updateValues(
          auth,
          googleSheetId,
          'Sheet1!A2',
          candidateRows
        );
      }


      return {
        jobId,
        arxenaJobId,
        arxenaResponse,
        candidatesResponse,
        googleSheetId,
        googleSheetUrl
      };

    } catch (error) {
      console.log('Error in job creation flow:', error);
    }
  }
}