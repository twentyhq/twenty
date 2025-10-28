import styled from '@emotion/styled';
import { useState } from 'react';

import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { Checkbox } from '@/ui/input/components/Checkbox';
import { useLingui } from '@lingui/react/macro';
import { IconUser } from 'twenty-ui/display';
import { useGetRolesQuery } from '~/generated/graphql';

const StyledRoleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-height: 200px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledRoleItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledRoleInfo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRoleLabel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

type ViewPickerRoleMultiSelectProps = {
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
};

export const ViewPickerRoleMultiSelect = ({
  selectedRoleIds,
  onChange,
}: ViewPickerRoleMultiSelectProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { data: rolesData, loading } = useGetRolesQuery();

  const roles = rolesData?.getRoles || [];

  const handleToggleRole = (roleId: string) => {
    const isSelected = selectedRoleIds.includes(roleId);

    if (isSelected) {
      onChange(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      onChange([...selectedRoleIds, roleId]);
    }
  };

  if (loading) {
    return <StyledEmptyState>{t`Loading roles...`}</StyledEmptyState>;
  }

  if (roles.length === 0) {
    return <StyledEmptyState>{t`No roles available`}</StyledEmptyState>;
  }

  return (
    <StyledRoleList>
      {roles.map((role) => {
        const isSelected = selectedRoleIds.includes(role.id);
        const RoleIcon = getIcon(role.icon) ?? IconUser;

        return (
          <StyledRoleItem
            key={role.id}
            onClick={() => handleToggleRole(role.id)}
          >
            <Checkbox checked={isSelected} onChange={() => {}} />
            <StyledRoleInfo>
              <RoleIcon size={16} />
              <StyledRoleLabel>{role.label}</StyledRoleLabel>
            </StyledRoleInfo>
          </StyledRoleItem>
        );
      })}
    </StyledRoleList>
  );
};

