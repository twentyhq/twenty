import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  Label,
  useIcons,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledSearchInput = styled(TextInput)`
  width: 100%;
  height: 40px;
  border-block: 1px solid ${({ theme }) => theme.border.color.medium};
  input {
    height: 40px;
    line-height: 40px;
    border: none;
    border-radius: 0;
    width: 100%;
  }
`;

const StyledBackButtonText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledBackButton = styled.button`
  width: 100%;
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)};
  text-align: left;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledLabel = styled(Label)`
  margin: ${({ theme }) => theme.spacing(3, 3, 0)};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1)};
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.spacing(1)};
  box-sizing: border-box;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledRowLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const CRUD_PERMISSIONS: Array<{
  key: SettingsRoleObjectPermissionKey;
  label: (objectLabel: string) => string;
}> = [
  {
    key: 'canReadObjectRecords',
    label: (objectLabel: string) => `See ${objectLabel}`,
  },
  {
    key: 'canUpdateObjectRecords',
    label: (objectLabel: string) => `Edit ${objectLabel}`,
  },
  {
    key: 'canSoftDeleteObjectRecords',
    label: (objectLabel: string) => `Delete ${objectLabel}`,
  },
  {
    key: 'canDestroyObjectRecords',
    label: (objectLabel: string) => `Destroy ${objectLabel}`,
  },
];

export const WorkflowAiAgentPermissionsTab1 = () => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();
  const [selectedObjectMetadata, setSelectedObjectMetadata] =
    useState<ObjectMetadataItem | null>(null);

  if (isDefined(selectedObjectMetadata)) {
    return (
      <StyledContainer>
        <StyledBackButton>
          <IconButton Icon={IconChevronLeft} variant="tertiary" size="small" />
          <StyledBackButtonText>{t`Add permission`}</StyledBackButtonText>
        </StyledBackButton>
        <StyledSearchInput placeholder={t`Type anything...`} />

        <div>
          <StyledLabel>CRUD</StyledLabel>
          <StyledList>
            {CRUD_PERMISSIONS.map((permission) => {
              return (
                <StyledRow key={permission.key}>
                  <StyledRowLeftContent>
                    <StyledIconContainer>
                      <PermissionIcon
                        permission={permission.key}
                        state="granted"
                      />
                    </StyledIconContainer>
                    <StyledText>
                      {selectedObjectMetadata &&
                        permission.label(selectedObjectMetadata.labelPlural)}
                    </StyledText>
                  </StyledRowLeftContent>
                  <IconButton
                    Icon={IconTrash}
                    variant="tertiary"
                    size="small"
                  />
                </StyledRow>
              );
            })}
          </StyledList>
        </div>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledBackButton>
        <IconButton Icon={IconChevronLeft} variant="tertiary" size="small" />
        <StyledBackButtonText>{t`Add permission`}</StyledBackButtonText>
      </StyledBackButton>
      <StyledSearchInput placeholder={t`Type anything...`} />

      <div>
        <StyledLabel>Objects</StyledLabel>
        <StyledList>
          {objectMetadataItems.map((objectMetadata) => {
            const IconComponent = getIcon(objectMetadata.icon);

            return (
              <StyledRow
                onClick={() => setSelectedObjectMetadata(objectMetadata)}
                key={objectMetadata.id}
              >
                <StyledRowLeftContent>
                  <StyledIconContainer>
                    <IconComponent size={theme.icon.size.sm} />
                  </StyledIconContainer>
                  <StyledText>{objectMetadata.labelPlural}</StyledText>
                </StyledRowLeftContent>
                <StyledIconChevronRight size={theme.icon.size.sm} />
              </StyledRow>
            );
          })}
        </StyledList>
      </div>
    </StyledContainer>
  );
};
