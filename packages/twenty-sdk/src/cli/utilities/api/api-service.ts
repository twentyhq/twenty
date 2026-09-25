import { ApiClient } from '@/cli/utilities/api/api-client';
import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { ApplicationApi } from '@/cli/utilities/api/application-api';
import { FileApi } from '@/cli/utilities/api/file-api';
import { LogicFunctionApi } from '@/cli/utilities/api/logic-function-api';
import { type ApplicationExport } from '@/cli/utilities/pull/application-export-type';
import { type Manifest } from 'twenty-shared/application';
import {
  type MetadataValidationErrorResponse,
  type SyncAction,
} from 'twenty-shared/metadata';

type ApiServiceOptions = {
  disableInterceptors?: boolean;
  serverUrl?: string;
  token?: string;
  skipAuth?: boolean;
};

export class ApiService {
  private apiClient: ApiClient;
  private applicationApi: ApplicationApi;
  private logicFunctionApi: LogicFunctionApi;
  private fileApi: FileApi;

  constructor(options?: ApiServiceOptions) {
    this.apiClient = new ApiClient(options);
    this.applicationApi = new ApplicationApi(this.apiClient.client);
    this.logicFunctionApi = new LogicFunctionApi(this.apiClient);
    this.fileApi = new FileApi(this.apiClient.client);
  }

  validateAuth(): Promise<{ authValid: boolean; serverUp: boolean }> {
    return this.apiClient.validateAuth();
  }

  getWorkspaceFrontendUrl(): Promise<string | null> {
    return this.apiClient.getWorkspaceFrontendUrl();
  }

  refreshToken(): Promise<string | null> {
    return this.apiClient.refreshToken();
  }

  findApplicationRegistrationByUniversalIdentifier(
    ...args: Parameters<
      ApplicationApi['findApplicationRegistrationByUniversalIdentifier']
    >
  ) {
    return this.applicationApi.findApplicationRegistrationByUniversalIdentifier(
      ...args,
    );
  }

  createApplicationRegistration(
    ...args: Parameters<ApplicationApi['createApplicationRegistration']>
  ) {
    return this.applicationApi.createApplicationRegistration(...args);
  }

  createDevelopmentApplication(
    ...args: Parameters<ApplicationApi['createDevelopmentApplication']>
  ) {
    return this.applicationApi.createDevelopmentApplication(...args);
  }

  syncApplication(
    manifest: Manifest,
    options?: { dryRun?: boolean; inferDeletionFromMissingEntities?: boolean },
  ): Promise<
    ApiResponse<
      {
        applicationUniversalIdentifier: string;
        actions: SyncAction[];
      },
      MetadataValidationErrorResponse
    >
  > {
    return this.applicationApi.syncApplication(manifest, options);
  }

  exportApplication(
    universalIdentifier: string,
  ): Promise<ApiResponse<ApplicationExport>> {
    return this.applicationApi.exportApplication(universalIdentifier);
  }

  uninstallApplication(universalIdentifier: string): Promise<ApiResponse> {
    return this.applicationApi.uninstallApplication(universalIdentifier);
  }

  syncMarketplaceCatalog(): Promise<ApiResponse<boolean>> {
    return this.applicationApi.syncMarketplaceCatalog();
  }

  getApplicationCoreGraphqlSchema(
    ...args: Parameters<ApplicationApi['getApplicationCoreGraphqlSchema']>
  ) {
    return this.applicationApi.getApplicationCoreGraphqlSchema(...args);
  }

  findLogicFunctions(
    ...args: Parameters<LogicFunctionApi['findLogicFunctions']>
  ) {
    return this.logicFunctionApi.findLogicFunctions(...args);
  }

  executeLogicFunction(
    ...args: Parameters<LogicFunctionApi['executeLogicFunction']>
  ) {
    return this.logicFunctionApi.executeLogicFunction(...args);
  }

  subscribeToLogs(...args: Parameters<LogicFunctionApi['subscribeToLogs']>) {
    return this.logicFunctionApi.subscribeToLogs(...args);
  }

  createFileUpload(...args: Parameters<FileApi['createFileUpload']>) {
    return this.fileApi.createFileUpload(...args);
  }

  completeAppTarballUpload(
    ...args: Parameters<FileApi['completeAppTarballUpload']>
  ) {
    return this.fileApi.completeAppTarballUpload(...args);
  }

  installTarballApp(...args: Parameters<FileApi['installTarballApp']>) {
    return this.fileApi.installTarballApp(...args);
  }

  createApplicationFileUploads(
    ...args: Parameters<FileApi['createApplicationFileUploads']>
  ) {
    return this.fileApi.createApplicationFileUploads(...args);
  }

  completeApplicationFileUploads(
    ...args: Parameters<FileApi['completeApplicationFileUploads']>
  ) {
    return this.fileApi.completeApplicationFileUploads(...args);
  }
}
