import { Injectable } from '@nestjs/common';

import { error } from 'console';

import fetch from 'node-fetch';
import base64 from 'base64-js';

import { FormDataDTO } from 'src/campaign/formdata.dto';

@Injectable()
export class CampaignService {
  constructor() {}

  checkFormValidity() {}

  queryDataCampaignForm(id: string) {
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
              validDate
            }
          }
        }
      }`,
      variables: {
        filter: {
          id: {
            eq: `${id}`,
          },
        },
        orderBy: {
          position: 'AscNullsFirst',
        },
      },
    };

    return queryDataCampaignFormExists;
  }

  queryDataLead(id) {
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
          id: {
            eq: `${id}`,
          },
        },
        orderBy: {
          position: 'AscNullsFirst',
        },
      },
    };

    return queryDataLeadExists;
  }

  queryDataCampaign(id) {
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
              endDate
            }}
      }}  `,
      variables: {
        filter: {
          id: {
            eq: `${id}`,
          },
        },
        orderBy: {
          position: 'AscNullsFirst',
        },
      },
    };

    return queryDataCampaignExists;
  }

  uri = 'http://localhost:3000/graphql';
  headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
  };

  async apiCall(queryData, queryDataName) {
    const response = await fetch(this.uri, {
      method: 'post',
      body: JSON.stringify(queryData),
      headers: this.headers,
    });

    let data = await response.json();

    data = data.data;
    if (queryDataName === 'campaignForms') {
      data = data?.campaignForms?.edges[0];
      console.log(data)
      let valid: boolean = false;

      if (data?.node?.validDate !== null) {
        console.log('askakskas', data?.node?.validDate);

        valid = Date.parse(data?.node?.validDate) > Date.parse(Date());
      }
      if (!valid) {
        throw error('Form is not Valid');
      }
    }
    if (queryDataName === 'campaignLists') {
      data = data.campaignLists.edges[0];
      let valid: boolean = false;

      if (data?.node?.endDate !== null) {
        console.log('askakskas', data?.node?.endDate);

        valid = Date.parse(data?.node?.endDate) > Date.parse(Date());
      }
      if (!valid) {
        throw error('Campaign is not Active');
      }
    }
    if (queryDataName === 'leads') {
      data = data.leads.edges[0];
    }

    return data == undefined;
  }

  async fetchLeadData(queryData) {
    try {
      const response = await fetch(this.uri, {
        method: 'post',
        body: JSON.stringify(queryData),
        headers: this.headers,
      });

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }
  extractIdsFromRandomId = (decodedRandomId: string) => {
    const idComponents = decodedRandomId.split('--');
    const leadId = idComponents[0];
    const formId = idComponents[1];
    const campaignId = idComponents[2];

    return {
      leadId,
      formId,
      campaignId,
    };
  };

  decodeRandomId = (encodedRandomId: string) => {
    const decodedRandomId = new TextDecoder().decode(
      base64.toByteArray(encodedRandomId),
    );

    return this.extractIdsFromRandomId(decodedRandomId);
  };
  queryAppointmentFormData(data, decoded_ids) {
    const queryAppointmentForm = {
      query: `mutation CreateOneAppointmentForm($input: AppointmentFormCreateInput!) {
        createAppointmentForm(data: $input) {
          id
        }
      }`,
      variables: {
        input: {
          email: `${data?.email ?? ''}`,
          firstName: `${data?.firstName ?? ''}`,
          lastName: `${data?.lastName ?? ''}`,
          appointmentDate: data?.appintmentDate ?? null,
          contactNumber: `${data?.contactNumber ?? ''}`,
          appointmentLocation: `${data?.appointmentLocation ?? ''}`,
          reasonForAppointment: `${data?.reasonForAppointment ?? ''}`,
          consent: `${data?.consent ?? ''}`,
          appointmentType: `${data?.appointmentType ?? ''}`,
          leadNameId: `${decoded_ids?.leadId}`,
        },
      },
    };

    return queryAppointmentForm;
  }

  async validateFormDetails(id: string) {
    const data = this.decodeRandomId(id);

    console.log(data);
    try {
      if (
        await this.apiCall(
          this.queryDataCampaignForm(data.formId),
          'campaignForms',
        )
      ) {
        throw error('Camapign Form Not Found');
      }
      if (
        await this.apiCall(
          this.queryDataCampaign(data.campaignId),
          'campaignLists',
        )
      ) {
        throw error('Camapign Name Not Found');
      }
      if (await this.apiCall(this.queryDataLead(data.leadId), 'leads')) {
        throw error('Lead Not Found');
      }
      const response = await this.fetchLeadData(
        this.queryDataLead(data.leadId),
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

  async saveFormResponse(id: string, formData: FormDataDTO) {
    try {
      const decoded_ids = this.decodeRandomId(id);

      const response = await fetch(this.uri, {
        method: 'post',
        body: JSON.stringify(
          this.queryAppointmentFormData(formData, decoded_ids),
        ),
        headers: this.headers,
      });

      const data = await response.json();
      console.log(data)
      if (data.errors) {
        throw error('Required Form Data is Invalid');
      }

      return 'Form Data Saved Successfully';
    } catch (error) {
      console.error(error);
    }
  }
}
