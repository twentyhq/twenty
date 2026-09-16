import { isBoolean, isString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import {
  SLACK_ACCESS_MODE_GET_ROUTE_PATH,
  SLACK_ACCESS_MODE_SET_ROUTE_PATH,
} from 'src/constants/slack-access-mode-route-path.constant';
import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { type SlackAccessMode } from 'src/logic-functions/types/slack-access-mode.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { isSlackAccessMode } from 'src/logic-functions/utils/is-slack-access-mode';

type SaveAccessModeResult = {
  success: boolean;
  message: string;
  error?: string;
};

type SlackAccessModeState = {
  accessMode: SlackAccessMode;
  hasAccessModeError: boolean;
  isAccessModeLoading: boolean;
  isSavingAccessMode: boolean;
  saveAccessMode: (
    accessMode: SlackAccessMode,
  ) => Promise<SaveAccessModeResult>;
};

const GENERIC_ERROR_RESULT: SaveAccessModeResult = {
  success: false,
  message: 'Could not save the access mode',
  error: 'The request failed. Please try again.',
};

export const useSlackAccessMode = (): SlackAccessModeState => {
  const [accessMode, setAccessMode] = useState<SlackAccessMode>(
    SLACK_ACCESS_MODE.ANYONE,
  );
  const [hasAccessModeError, setHasAccessModeError] = useState(false);
  const [isAccessModeLoading, setIsAccessModeLoading] = useState(true);
  const [isSavingAccessMode, setIsSavingAccessMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAccessMode = async () => {
      try {
        const result = await new RestApiClient().get(
          `/s${SLACK_ACCESS_MODE_GET_ROUTE_PATH}`,
        );

        if (!cancelled) {
          const record = asRecord(result);

          const readAccessMode = record?.accessMode;

          if (isSlackAccessMode(readAccessMode)) {
            setAccessMode(readAccessMode);
          }

          setHasAccessModeError(
            record?.isAccessModeReadable === false ||
              !isSlackAccessMode(readAccessMode),
          );
        }
      } catch {
        if (!cancelled) {
          setHasAccessModeError(true);
        }
      } finally {
        if (!cancelled) {
          setIsAccessModeLoading(false);
        }
      }
    };

    fetchAccessMode();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveAccessMode = async (
    nextAccessMode: SlackAccessMode,
  ): Promise<SaveAccessModeResult> => {
    setIsSavingAccessMode(true);

    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_ACCESS_MODE_SET_ROUTE_PATH}`,
        { accessMode: nextAccessMode },
      );

      const record = asRecord(result);

      if (!isDefined(record) || !isBoolean(record.success)) {
        return GENERIC_ERROR_RESULT;
      }

      if (record.success) {
        setAccessMode(nextAccessMode);
        setHasAccessModeError(false);
      }

      return {
        success: record.success,
        message: isString(record.message) ? record.message : '',
        error: isString(record.error) ? record.error : undefined,
      };
    } catch {
      return GENERIC_ERROR_RESULT;
    } finally {
      setIsSavingAccessMode(false);
    }
  };

  return {
    accessMode,
    hasAccessModeError,
    isAccessModeLoading,
    isSavingAccessMode,
    saveAccessMode,
  };
};
