import { ApiClient } from '@/cli/utilities/api/api-client';
import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { ApplicationApi } from '@/cli/utilities/api/application-api';
import { FileApi } from '@/cli/utilities/api/file-api';
import { LogicFunctionApi } from '@/cli/utilities/api/logic-function-api';
import { SchemaApi } from '@/cli/utilities/api/schema-api';
import { type Manifest } from 'twenty-shared/application';

type ApiServiceOptions = {
  disableInterceptors?: boolean;
  serverUrl?: string;
  token?: string;
  skipAuth?: boolean;
};

export class ApiService {
  private apiClient: ApiClient;
  private applicationApi: ApplicationApi;
  private schemaApi: SchemaApi;
  private logicFunctionApi: LogicFunctionApi;
  private fileApi: FileApi;

  constructor(options?: ApiServiceOptions) {
    this.apiClient = new ApiClient(options);
    this.applicationApi = new ApplicationApi(this.apiClient.client);
    this.schemaApi = new SchemaApi(this.apiClient.client);
    this.logicFunctionApi = new LogicFunctionApi(this.apiClient);
    this.fileApi = new FileApi(this.apiClient.client);
  }

  validateAuth(): Promise<{ authValid: boolean; serverUp: boolean }> {
    return this.apiClient.validateAuth();
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

  syncApplication(manifest: Manifest): Promise<ApiResponse> {
    return this.applicationApi.syncApplication(manifest);
  }

  uninstallApplication(universalIdentifier: string): Promise<ApiResponse> {
    return this.applicationApi.uninstallApplication(universalIdentifier);
  }

  syncMarketplaceCatalog(): Promise<ApiResponse<boolean>> {
    return this.applicationApi.syncMarketplaceCatalog();
  }

  getSchema(options?: { authToken?: string }): Promise<ApiResponse<string>> {
    return this.schemaApi.getSchema(options);
  }

  getMetadataSchema(options?: {
    authToken?: string;
  }): Promise<ApiResponse<string>> {
    return this.schemaApi.getMetadataSchema(options);
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

  uploadAppTarball(...args: Parameters<FileApi['uploadAppTarball']>) {
    return this.fileApi.uploadAppTarball(...args);
  }

  installTarballApp(...args: Parameters<FileApi['installTarballApp']>) {
    return this.fileApi.installTarballApp(...args);
  }

  uploadFile(...args: Parameters<FileApi['uploadFile']>) {
    return this.fileApi.uploadFile(...args);
  }
}
