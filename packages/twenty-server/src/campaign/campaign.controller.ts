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
          'campaignLists',
        )
      ) {
        throw error('Campaign Name Not Found');
      }
      if (await this.apiCall(this.queryDataLead(data.leadName), 'leads')) {
        throw error('Lead Not Found');
      }
      const response = await this.fetchLeadData(
        this.queryDataLead(data.leadName),
      );

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
          campaignName: {
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
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MTE2MzExMTEsImV4cCI6MTcxMjkyNzEwOSwianRpIjoiZGZiZTgxMjEtNGYyYi00NDVkLTg3MWQtMjk5OWRhYTQ0MGU1In0.fwtgVRXgtR8KBEEQVe3-axuzGjBhCcyTTBvgG27goBQ',
        },
      });

      let data = await response.json();
      data = data.data;
      if (queryDataName === 'campaignForms') {
        data = data.campaignForms.edges[0];
      }
      if (queryDataName === 'campaignLists') {
        data = data.campaignLists.edges[0];
      }
      if (queryDataName === 'leads') {
        data = data.leads.edges[0];
      }

      return data == undefined;
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
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJpYXQiOjE3MTE2MzExMTEsImV4cCI6MTcxMjkyNzEwOSwianRpIjoiZGZiZTgxMjEtNGYyYi00NDVkLTg3MWQtMjk5OWRhYTQ0MGU1In0.fwtgVRXgtR8KBEEQVe3-axuzGjBhCcyTTBvgG27goBQ',
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
