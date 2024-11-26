import { useFeatureFlagsManagement } from '@/settings/admin-panel/hooks/useFeatureFlagsManagement';
import { TextInput } from '@/ui/input/components/TextInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useState } from 'react';
import { Button, H2Title, IconSearch, Section, Toggle } from 'twenty-ui';

const StyledLinkContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledErrorSection = styled.div`
  color: ${({ theme }) => theme.font.color.danger};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledWorkspaceSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledUserInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

export const SettingsAdminFeatureFlags = () => {
  const [userIdentifier, setUserIdentifier] = useState('');

  const {
    userLookupResult,
    handleUserLookup,
    handleFeatureFlagUpdate,
    isLoading,
    error,
  } = useFeatureFlagsManagement();

  const handleSearch = async () => {
    await handleUserLookup(userIdentifier);
  };

  return (
    <>
      <Section>
        <H2Title
          title="Feature Flags Management"
          description="Look up users and manage their workspace feature flags."
        />

        <StyledContainer>
          <StyledLinkContainer>
            <TextInput
              value={userIdentifier}
              onChange={setUserIdentifier}
              placeholder="Enter user ID or email"
              fullWidth
              disabled={isLoading}
            />
          </StyledLinkContainer>
          <Button
            Icon={IconSearch}
            variant="primary"
            accent="blue"
            title="Search"
            onClick={handleSearch}
            disabled={!userIdentifier.trim() || isLoading}
          />
        </StyledContainer>

        {error && <StyledErrorSection>{error}</StyledErrorSection>}
      </Section>
      <Section>
        {userLookupResult && (
          <>
            <StyledUserInfo>
              <H2Title
                title={userLookupResult.user.email}
                description={`${userLookupResult.user.firstName || ''} ${userLookupResult.user.lastName || ''}`.trim()}
              />
            </StyledUserInfo>

            {userLookupResult.workspaces.map((workspace) => (
              <StyledWorkspaceSection key={workspace.id}>
                <H2Title
                  title={workspace.name}
                  description={'Workspace Name'}
                />
                <H2Title
                  title={`${workspace.totalUsers} users`}
                  description={'Total Users'}
                />

                <StyledTable>
                  <TableRow
                    gridAutoColumns="1fr 100px"
                    mobileGridAutoColumns="1fr 80px"
                  >
                    <TableHeader>Feature Flag</TableHeader>
                    <TableHeader align="right">Status</TableHeader>
                  </TableRow>

                  {workspace.featureFlags.map((flag) => (
                    <TableRow
                      gridAutoColumns="1fr 100px"
                      mobileGridAutoColumns="1fr 80px"
                      key={flag.key}
                    >
                      <TableCell>{flag.key}</TableCell>
                      <TableCell align="right">
                        <Toggle
                          value={flag.value}
                          onChange={(newValue) =>
                            handleFeatureFlagUpdate(
                              workspace.id,
                              flag.key,
                              newValue,
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </StyledTable>
              </StyledWorkspaceSection>
            ))}
          </>
        )}
      </Section>
    </>
  );
};
