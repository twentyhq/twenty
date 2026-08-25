import { isBoolean, isString } from '@sniptt/guards';
import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_SET_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { asRecord } from 'src/front-components/utils/as-record.util';
import { type SlackSetUserLinkInput } from 'src/logic-functions/types/slack-set-user-link-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

const GENERIC_ERROR_RESULT: SlackToolResult = {
  success: false,
  message: 'Could not save the link',
  error: 'The request failed. Please try again.',
};

const toSlackToolResult = (value: unknown): SlackToolResult => {
  const record = asRecord(value);

  if (record === undefined || !isBoolean(record.success)) {
    return GENERIC_ERROR_RESULT;
  }

  return {
    success: record.success,
    message: isString(record.message) ? record.message : '',
    error: isString(record.error) ? record.error : undefined,
  };
};

type SetSlackUserLinkState = {
  setSlackUserLink: (input: SlackSetUserLinkInput) => Promise<SlackToolResult>;
  isSubmitting: boolean;
};

export const useSetSlackUserLink = (): SetSlackUserLinkState => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setSlackUserLink = async (
    input: SlackSetUserLinkInput,
  ): Promise<SlackToolResult> => {
    setIsSubmitting(true);

    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_USER_LINKS_SET_ROUTE_PATH}`,
        input,
      );

      return toSlackToolResult(result);
    } catch {
      return GENERIC_ERROR_RESULT;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { setSlackUserLink, isSubmitting };
};
