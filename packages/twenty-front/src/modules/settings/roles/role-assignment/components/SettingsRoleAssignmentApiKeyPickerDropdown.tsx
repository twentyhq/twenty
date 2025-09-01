import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { type ChangeEvent, useState } from 'react';
import { type ApiKey, useGetApiKeysQuery } from '~/generated-metadata/graphql';

const StyledLoadingContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

const StyledDropdownItem = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledItemName = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledItemSubtext = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

type SettingsRoleAssignmentApiKeyPickerDropdownProps = {
  excludedApiKeyIds: string[];
  onSelect: (apiKey: ApiKey) => void;
};

export const SettingsRoleAssignmentApiKeyPickerDropdown = ({
  excludedApiKeyIds,
  onSelect,
}: SettingsRoleAssignmentApiKeyPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const { t } = useLingui();

  const { data: apiKeysData, loading } = useGetApiKeysQuery();
  const apiKeys = apiKeysData?.apiKeys || [];

  const filteredApiKeys = apiKeys.filter(
    (apiKey) =>
      !excludedApiKeyIds.includes(apiKey.id) &&
      apiKey.name.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder={t`Search API keys`}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {loading ? (
          <StyledLoadingContainer>{t`Loading...`}</StyledLoadingContainer>
        ) : filteredApiKeys.length > 0 ? (
          filteredApiKeys.map((apiKey) => (
            <StyledDropdownItem
              key={apiKey.id}
              onClick={() => onSelect(apiKey)}
            >
              <StyledItemName>{apiKey.name}</StyledItemName>
              <StyledItemSubtext>
                Expires:{' '}
                {apiKey.expiresAt
                  ? new Date(apiKey.expiresAt).toLocaleDateString()
                  : 'Never'}
              </StyledItemSubtext>
            </StyledDropdownItem>
          ))
        ) : (
          <StyledEmptyState>
            {searchFilter
              ? t`No API keys match your search`
              : t`No API keys available`}
          </StyledEmptyState>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
