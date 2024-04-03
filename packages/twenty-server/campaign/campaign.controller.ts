import { Controller, Get, Query } from '@nestjs/common';

import { error } from 'console';

import fetch from 'node-fetch';
import base64 from 'base64-js';

import { CampaignService } from 'src/campaign/campaign.service';
@Controller('campaign')
export class CampaignController {
  constructor(private health: CampaignService) {}

  @Get()
  async validateFormDetails(@Query('id') id: string) {
    const data = this.decodeRandomId(id);

    try {
      if (
        await this.apiCall(
          this.queryDataCampaignForm(data.formName),
          'campaignForms',
        )
      ) {
        throw error('Camapign Form Not Found');
      }
      if (
        await this.apiCall(
          this.queryDataCampaign(data.campaignName),
          'campaign',
        )
      ) {
        throw error('Camapign NAme Not Found');
      }
      if (await this.apiCall(this.queryDataLead(data.leadName), 'leads')) {
        throw error('Lead Not Found');
      }
      const response = await this.fetchLeadData(
        this.queryDataLead(data.leadName),
      );

      // console.log(response?.data?.leads?.edges[0].node?.name);
      const fetchedData = {
        name: response?.data?.leads?.edges[0].node?.name,
        email: response?.data?.leads?.edges[0].node?.email,
      };

      return fetchedData;
    } catch (error) {
      console.error(error);
    }
  }

  queryDataCampaignForm(name) {
    const queryDataCampaignFormExists = {
      query: `query CampaignForms($filter: CampaignFormFilterInput, $orderBy: CampaignFormOrderByInput, $lastCursor: String, $limit: Float) {
        campaignForms(
          filter: $filter
          orderBy: $orderBy
          first: $limit
          after: $lastCursor
        ) {
          edges {
            node {
              id
            }
          }
        }
      }`,
      variables: {
        filter: {
          name: {
            like: `%${name}%`,
          },
        },
        orderBy: {
          position: 'AscNullsFirst',
        },
      },
    };

    return queryDataCampaignFormExists;
  }

  queryDataLead(name) {
    const queryDataLeadExists = {
      query: `query FindManyLeads($filter: LeadFilterInput, $orderBy: LeadOrderByInput, $lastCursor: String, $limit: Float) {
        leads(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor) {
          edges {
            node {
              id,
              name,
              email
            }
          }
        }
      }`,
      variables: {
        filter: {
          name: {
            like: `%${name}%`,
          },
        },
        orderBy: {
          position: 'AscNullsFirst',
        },
      },
    };

    return queryDataLeadExists;
  }

  queryDataCampaign(name) {
    const queryDataCampaignExists = {
      query: `query FindManyCampaignLists($filter: CampaignListFilterInput, $orderBy: CampaignListOrderByInput, $lastCursor: String, $limit: Float) {
        campaignLists(
          filter: $filter
          orderBy: $orderBy
          first: $limit
          after: $lastCursor
        ) {
          edges {
            node {
              id
            }}
      }}  `,
      variables: {
        filter: {
          name: {
            like: `%${name}%`,
          },
        },
        orderBy: {
          position: 'AscNullsFirst',
        },
      },
    };

    return queryDataCampaignExists;
  }

  async apiCall(queryData, queryDataName) {
    try {
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'post',
        body: JSON.stringify(queryData),
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MTE1OTkyNzEsImV4cCI6MTcxMjg5NTI3MCwianRpIjoiNDNhMjZmOWMtMzMxYy00ZWM3LWJmYzktM2IzZmZmYTNkYThhIn0.LkGq4ggib60CpqXTdTy4JI0_p6ogfMQsuglHGxfE0tg',
        },
      });

      const data = await response.json();

      return (data.data.leads.edges.length > 0);
    } catch (error) {
      console.error(error);
    }
  }

  async fetchLeadData(queryData) {
    try {
      const response = await fetch('http://localhost:3000/graphql', {
        method: 'post',
        body: JSON.stringify(queryData),
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MTE1OTkyNzEsImV4cCI6MTcxMjg5NTI3MCwianRpIjoiNDNhMjZmOWMtMzMxYy00ZWM3LWJmYzktM2IzZmZmYTNkYThhIn0.LkGq4ggib60CpqXTdTy4JI0_p6ogfMQsuglHGxfE0tg',
        },
      });

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }
  extractIdsFromRandomId = (decodedRandomId: string) => {
    const idComponents = decodedRandomId.split('-');
    const leadName = idComponents[0];
    const formName = idComponents[1];
    const campaignName = idComponents[2];

    return {
      leadName,
      formName,
      campaignName,
    };
  };

  decodeRandomId = (encodedRandomId: string) => {
    const decodedRandomId = new TextDecoder().decode(
      base64.toByteArray(encodedRandomId),
    );

    return this.extractIdsFromRandomId(decodedRandomId);
  };
}
