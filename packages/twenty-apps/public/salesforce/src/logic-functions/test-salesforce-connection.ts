import { defineLogicFunction } from 'twenty-sdk/define';

import { TEST_CONNECTION_ROUTE_PATH } from 'src/constants/route-paths';
import { TEST_CONNECTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SalesforceClient } from 'src/logic-functions/salesforce/salesforce-client';
import { getErrorMessage } from 'src/logic-functions/salesforce/salesforce-errors';

const handler = async (): Promise<{
  success: boolean;
  orgId?: string;
  orgName?: string;
  currencyIsoCode?: string;
  apiVersion?: string;
  error?: string;
}> => {
  try {
    const salesforceClient = new SalesforceClient();
    const orgInfo = await salesforceClient.getOrgInfo();

    return {
      success: true,
      orgId: orgInfo.orgId,
      orgName: orgInfo.orgName,
      currencyIsoCode: orgInfo.currencyIsoCode,
      apiVersion: salesforceClient.apiVersion,
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
};

export default defineLogicFunction({
  universalIdentifier: TEST_CONNECTION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'test-salesforce-connection',
  description:
    'Verifies the Salesforce connection and returns organization details.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: TEST_CONNECTION_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
