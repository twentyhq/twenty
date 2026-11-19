import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type GoogleMeetSmartNote } from 'src/logic-functions/types/google-meet-smart-note.type';
import { convertGoogleDocTabToMarkdown } from 'src/logic-functions/utils/convert-google-doc-tab-to-markdown.util';
import { getGoogleDoc } from 'src/logic-functions/utils/get-google-doc.util';

export const findGoogleMeetSmartNotesMarkdown = async ({
  accessToken,
  smartNotes,
}: {
  accessToken: string;
  smartNotes: Pick<GoogleMeetSmartNote, 'docsDestination'>[];
}): Promise<string | undefined> => {
  const documentId = smartNotes
    .map(({ docsDestination }) => docsDestination?.document)
    .find(isNonEmptyString);

  if (!isNonEmptyString(documentId)) {
    return undefined;
  }

  const [notesTab] =
    (await getGoogleDoc({ accessToken, documentId }))?.tabs ?? [];
  if (!isDefined(notesTab)) {
    return undefined;
  }

  const markdown = convertGoogleDocTabToMarkdown(notesTab);

  return isNonEmptyString(markdown) ? markdown : undefined;
};
