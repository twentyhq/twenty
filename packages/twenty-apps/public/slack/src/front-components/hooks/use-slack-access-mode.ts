import { isBoolean, isString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import {
  SLACK_ACCESS_MODE_GET_ROUTE_PATH,
  SLACK_ACCESS_MODE_SET_ROUTE_PATH,
} from 'src/constants/slack-access-mode-route-path.constant';
import { asRecord } from 'src/front-components/utils/as-record.util';
import {
  SLACK_ACCESS_MODE,
  type SlackAccessMode,
} from 'src/logic-functions/constants/slack-access-mode';

type SaveAccessModeResult = {
  success: boolean;
  message: string;
  error?: string;
};

type SlackAccessModeState = {
  accessMode: SlackAccessMode;
  isAccessModeLoading: boolean;
  isSavingAccessMode: boolean;
  saveAccessMode: (accessMode: SlackAccessMode) => Promise<SaveAccessModeResult>;
};

const GENERIC_ERROR_RESULT: SaveAccessModeResult = {
  success: false,
  message: 'Could not save the access mode',
  error: 'The request failed. Please try again.',
};

const toAccessMode = (value: unknown): SlackAccessMode =>
  value === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
    ? SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
    : SLACK_ACCESS_MODE.ANYONE;

export const useSlackAccessMode = (): SlackAccessModeState => {
  const [accessMode, setAccessMode] = useState<SlackAccessMode>(
    SLACK_ACCESS_MODE.ANYONE,
  );
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
          setAccessMode(toAccessMode(asRecord(result)?.accessMode));
        }
      } catch {
        // Leave the default ANYONE when the read fails.
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

      if (record === undefined || !isBoolean(record.success)) {
        return GENERIC_ERROR_RESULT;
      }

      if (record.success) {
        setAccessMode(nextAccessMode);
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
    isAccessModeLoading,
    isSavingAccessMode,
    saveAccessMode,
  };
};
