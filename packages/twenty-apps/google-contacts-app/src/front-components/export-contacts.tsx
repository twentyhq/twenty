import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Command,
  CommandModal,
  enqueueSnackbar,
  useSelectedRecordIds,
  type EnqueueSnackbarParams,
} from 'twenty-sdk/front-component';

import { EXPORT_CONTACTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const EXPORT_CONTACTS_ROUTE_PATH = '/s/export-google-contacts';

type ExportContactsStatus =
  | 'exported'
  | 'auth-failed'
  | 'no-connection'
  | 'no-contacts-found'
  | 'too-many-contacts';

type ExportContactsResponse = {
  status: ExportContactsStatus;
  created?: number;
  updated?: number;
  failed?: number;
  limit?: number;
};

const pluralizeContacts = (count: number): string =>
  count === 1 ? '1 contact' : `${count} contacts`;

const describeExport = ({
  created = 0,
  updated = 0,
  failed = 0,
}: ExportContactsResponse): EnqueueSnackbarParams => {
  if (created + updated === 0) {
    return {
      message: 'No contact could be sent to Google Contacts.',
      variant: 'error',
    };
  }

  const sentMessage = `Sent ${pluralizeContacts(created + updated)} to Google Contacts (${created} created, ${updated} updated).`;

  return failed === 0
    ? { message: sentMessage, variant: 'success' }
    : {
        message: `${sentMessage} ${pluralizeContacts(failed)} failed.`,
        variant: 'warning',
      };
};

const describeResponse = (
  response: ExportContactsResponse,
): EnqueueSnackbarParams => {
  switch (response.status) {
    case 'exported':
      return describeExport(response);
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
    case 'too-many-contacts':
      return {
        message: `Select at most ${response.limit} people to send at once.`,
        variant: 'error',
      };
    default:
      return {
        message: 'No contact to send to Google Contacts.',
        variant: 'error',
      };
  }
};

const ExportContacts = () => {
  const selectedRecordIds = useSelectedRecordIds();

  if (selectedRecordIds.length === 0) {
    return (
      <Command
        execute={() =>
          enqueueSnackbar({
            message: 'Select at least one person to send to Google Contacts.',
            variant: 'error',
          })
        }
      />
    );
  }

  const execute = async () => {
    try {
      const response = await new RestApiClient().post<ExportContactsResponse>(
        EXPORT_CONTACTS_ROUTE_PATH,
        { personIds: selectedRecordIds },
      );

      await enqueueSnackbar(describeResponse(response));
    } catch (error) {
      console.error('[google-contacts] Export request failed', error);

      await enqueueSnackbar({
        message: 'Failed to send contacts to Google Contacts.',
        variant: 'error',
      });
    }
  };

  return (
    <CommandModal
      title="Send to Google Contacts"
      subtitle={`${pluralizeContacts(selectedRecordIds.length)} will be created or updated in the Google account you connected.`}
      confirmButtonText="Send"
      execute={execute}
    />
  );
};

export default defineFrontComponent({
  universalIdentifier: EXPORT_CONTACTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'export-contacts',
  description: 'Sends the selected people to Google Contacts',
  isHeadless: true,
  component: ExportContacts,
});
