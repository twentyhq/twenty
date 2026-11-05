import { useMutation } from '@apollo/client/react';
import { plural } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SyncMcpServerToolsDocument } from '~/generated-metadata/graphql';

export const useSyncMcpServerTools = () => {
  const { enqueueToast } = useToast();

  const [syncMcpServerToolsMutation, { loading: isSyncingMcpServerTools }] =
    useMutation(SyncMcpServerToolsDocument);

  const syncMcpServerTools = async (mcpServerId: string) => {
    try {
      const { data } = await syncMcpServerToolsMutation({
        variables: { id: mcpServerId },
      });

      if (!isDefined(data)) {
        return;
      }

      const { tools, toolsSyncError } = data.syncMcpServerTools;

      if (isNonEmptyString(toolsSyncError)) {
        enqueueToast({ status: 'error', children: toolsSyncError });
        return;
      }

      enqueueToast({
        status: 'success',
        children: plural(tools.length, {
          one: 'Synced # tool',
          other: 'Synced # tools',
        }),
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { syncMcpServerTools, isSyncingMcpServerTools };
};
