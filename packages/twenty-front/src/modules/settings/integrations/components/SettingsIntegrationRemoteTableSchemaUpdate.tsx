import { FetchResult } from '@apollo/client';
import styled from '@emotion/styled';
import { IconReload } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';
import {
  DistantTableUpdate,
  SyncRemoteTableSchemaChangesMutation,
} from '~/generated-metadata/graphql';

const StyledText = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: 0;
`;

export const getDistantTableUpdatesText = (
  schemaPendingUpdates: DistantTableUpdate[],
) => {
  if (schemaPendingUpdates.includes(DistantTableUpdate.TableDeleted)) {
    return 'Table has been deleted';
  }
  if (
    schemaPendingUpdates.includes(DistantTableUpdate.ColumnsAdded) &&
    schemaPendingUpdates.includes(DistantTableUpdate.ColumnsDeleted)
  ) {
    return 'Columns have been added and other deleted';
  }
  if (schemaPendingUpdates.includes(DistantTableUpdate.ColumnsAdded)) {
    return 'Columns have been added';
  }
  if (schemaPendingUpdates.includes(DistantTableUpdate.ColumnsDeleted)) {
    return 'Columns have been deleted';
  }
  return null;
};

type SettingsIntegrationRemoteTableSchemaUpdateProps = {
  updatesText: string;
  onUpdate: () => Promise<FetchResult<SyncRemoteTableSchemaChangesMutation>>;
};

export const SettingsIntegrationRemoteTableSchemaUpdate = ({
  updatesText,
  onUpdate,
}: SettingsIntegrationRemoteTableSchemaUpdateProps) => {
  return (
    <>
      {updatesText && <StyledText>{updatesText}</StyledText>}
      {updatesText && (
        <Button
          Icon={IconReload}
          title="Update"
          size="small"
          onClick={onUpdate}
        />
      )}
    </>
  );
};
