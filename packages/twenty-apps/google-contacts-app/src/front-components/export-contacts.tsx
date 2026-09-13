import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Command,
  enqueueSnackbar,
  useSelectedRecordIds,
  type EnqueueSnackbarParams,
} from 'twenty-sdk/front-component';

import { EXPORT_CONTACTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { EXPORT_CONTACTS_ROUTE_PATH } from 'src/constants/route-paths';

type ExportContactsStatus =
  | 'exported'
  | 'auth-failed'
  | 'no-connection'
  | 'no-contacts-found';

type ExportContactsResponse = {
  status: ExportContactsStatus;
};

const pluralizeContacts = (count: number): string =>
  count === 1 ? '1 contact' : `${count} contacts`;

const describeResponse = (
  response: ExportContactsResponse,
  records: number
): EnqueueSnackbarParams => {
  switch (response.status) {
    case 'exported':
      return {
        message: `Sent ${pluralizeContacts(records)}`,
        variant: 'success',
      };
    case 'no-connection':
      return {
        message: 'Connect your Google account before sending contacts.',
        variant: 'error',
      };
    case 'auth-failed':
      return {
        message: 'Reconnect your Google account before sending contacts.',
        variant: 'error',
      };
    case "no-contacts-found":
    default:
      return {
        message: 'No contact to send to Google Contacts.',
        variant: 'error',
      };
  }
};

const ExportContacts = () => {
  const selectedRecordIds = useSelectedRecordIds();

  const execute = async () => {
    try {
      const response = await new RestApiClient().post<ExportContactsResponse>(
        `/s${EXPORT_CONTACTS_ROUTE_PATH}`,
        { recordIds: selectedRecordIds },
      );

      await enqueueSnackbar(describeResponse(response, selectedRecordIds.length));
    } catch (error) {
      console.error('[google-contacts] Export request failed', error);

      await enqueueSnackbar({
        message: 'Failed to send contacts to Google Contacts.',
        variant: 'error',
      });
    }
  };

  return <Command execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier: EXPORT_CONTACTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'export-contacts',
  description: 'Sends the selected people to Google Contacts',
  isHeadless: true,
  component: ExportContacts,
});
