import { useEffect } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  unmountFrontComponent,
  useRecordId,
} from 'twenty-sdk/front-component';
import { CoreApiClient } from 'twenty-client-sdk/core';

const MEETING_BASE_URL = 'https://meet.jit.si';

// Jitsi creates the room on first join, so an unguessable name is enough.
// crypto.randomUUID is unavailable in the front component sandbox, which is
// not a secure context.
const generateRoomName = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

const GenerateMeetingLinkEffect = () => {
  const recordId = useRecordId();

  useEffect(() => {
    const generateMeetingLink = async () => {
      try {
        if (recordId === null) {
          throw new Error('Open a company to generate a meeting link');
        }

        const meetingUrl = `${MEETING_BASE_URL}/${generateRoomName()}`;

        await new CoreApiClient().mutation({
          updateCompany: {
            __args: {
              id: recordId,
              data: {
                meetingLink: {
                  primaryLinkUrl: meetingUrl,
                  primaryLinkLabel: 'Video meeting',
                },
              },
            },
            id: true,
          },
        });

        await enqueueSnackbar({
          message: 'Meeting link generated',
          variant: 'success',
        });
      } catch (error) {
        await enqueueSnackbar({
          message:
            error instanceof Error
              ? error.message
              : 'Failed to generate meeting link',
          variant: 'error',
        });
      }

      await unmountFrontComponent();
    };

    generateMeetingLink();
  }, [recordId]);

  return null;
};

export const GENERATE_MEETING_LINK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'cef0a185-ba1c-467c-a7cf-ab51ff176264';

export default defineFrontComponent({
  universalIdentifier:
    GENERATE_MEETING_LINK_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Generate meeting link',
  description: 'Writes a new video meeting link into the Meeting link field',
  isHeadless: true,
  component: GenerateMeetingLinkEffect,
});
