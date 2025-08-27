import { type FetchResult } from '@apollo/client';
import { styled } from '@linaria/react';

import { IconReload } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { type SyncRemoteTableSchemaChangesMutation } from '~/generated-metadata/graphql';

const StyledText = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: 0;
`;

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
