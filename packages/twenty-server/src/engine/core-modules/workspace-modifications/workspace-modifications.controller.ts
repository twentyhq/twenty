import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import axios from 'axios';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { CreateMetaDataStructure } from './object-apis/object-apis-creation';
import { WorkspaceQueryService } from './workspace-modifications.service';
export async function axiosRequest(data: string, apiToken: string) {
  // console.log("Sending a post request to the graphql server:: with data", data);
  const response = await axios.request({
    method: 'post',
    url: process.env.GRAPHQL_URL,
    headers: {
      authorization: 'Bearer ' + apiToken,
      'content-type': 'application/json',
    },
    data: data,
  });
  return response;
}

@Controller('workspace-modifications')
export class WorkspaceModificationsController {
  constructor(
    private readonly workspaceQueryService: WorkspaceQueryService,
  ) {
    console.log('GraphQL URL configured as:', process.env.GRAPHQL_URL);
  }

  @Get('api-keys')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceApiKeys(@Req() req) {
    console.log("getWorkspaceApiKeys")
    const { user, apiKey, workspace, workspaceMemberId } =  await this.workspaceQueryService.accessTokenService.validateToken(req);
    console.log("workspace:", workspace)
    console.log("apiKey:", apiKey)
    console.log("workspaceMemberId:", workspaceMemberId)
    console.log("user:", user)
    const keys = await this.workspaceQueryService.getWorkspaceApiKeys(workspace.id);
    console.log("keys::", keys)
    return keys;
  }
  
  @Get('fetch-all-current-objects')
  @UseGuards(JwtAuthGuard)
  async fetchAllCurrentObjects(@Req() req) {
    console.log("getWorkspaceApiKeys")
    const apiToken = req.headers.authorization.split(' ')[1];
    // const existingObjectsResponse = await new CreateMetaDataStructure(this.workspaceQueryService).fetchAllCurrentObjects(apiToken);
    const existingObjectsResponse = await new CreateMetaDataStructure(this.workspaceQueryService).fetchObjectsNameIdMap(apiToken);

    console.log("existingObjectsResponse:", existingObjectsResponse)
    return existingObjectsResponse;
  }

  @Get('api-keys/:keyName')
  @UseGuards(JwtAuthGuard)
  async getSpecificApiKey(@Req() req, @Param('keyName') keyName: string) {
    const { user, apiKey, workspace, workspaceMemberId } =  await this.workspaceQueryService.accessTokenService.validateToken(req);
    return this.workspaceQueryService.getSpecificWorkspaceKey(workspace.id, keyName);
  }


  // Backend controller modification
  @Post('api-keys')
  @UseGuards(JwtAuthGuard)
  async updateWorkspaceApiKeys(@Req() req, @Body() keys: {
    openaikey?: string;
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    smartProxyUrl?: string;
    whatsappKey?: string;
    anthropicKey?: string;
    facebookWhatsappApiToken?: string;
    facebookWhatsappPhoneNumberId?: string;
    facebookWhatsappAppId?: string;
  }) {
    const { user, apiKey, workspace, workspaceMemberId } =  await this.workspaceQueryService.accessTokenService.validateToken(req);
    console.log("workspace:", workspace)
    console.log("apiKey:", apiKey)
    console.log("workspaceMemberId:", workspaceMemberId)
    console.log("user:", user)
    return this.workspaceQueryService.updateWorkspaceApiKeys(workspace.id, keys);
  }

  @Post('create-metadata-structure')
  @UseGuards(JwtAuthGuard)
  async createMetaDataStructure(@Req() req) {
    const apiToken = req.headers.authorization.split(' ')[1];
    new CreateMetaDataStructure(this.workspaceQueryService).createMetadataStructure(apiToken);
    return
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req) {
    const user = req.user;
    return { user };
  }

}
