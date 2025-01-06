import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Node, NodeProps } from '@xyflow/react';
import { Link } from 'react-router-dom';
import { Button, useIcons } from 'twenty-ui';

import { SettingsRoleTypeTag } from '@/settings/roles/SettingsRoleTypeTag';
import { getRoleTypeLabel } from '@/settings/roles/utils/getRoleTypeLabel';
// import '@reactflow/node-resizer/dist/style.css';
import { useState } from 'react';
import { RoleItem } from '~/pages/settings/roles/useMockRoles';
import { capitalize } from '~/utils/string/capitalize';

type SettingsDataRoleOverviewObjectNode = Node<RoleItem, 'object'>;
type SettingsDataRoleOverviewObjectProps =
  NodeProps<SettingsDataRoleOverviewObjectNode>;

const StyledNode = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledObjectName = styled.div`
  border: 0;
  border-radius: 4px 4px 0 0;
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
  text-align: center;
`;

const StyledInnerCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)} 0
    ${({ theme }) => theme.spacing(2)} 0;
  display: flex;
  flex-flow: column nowrap;
  gap: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: 8px;
  padding-top: 0px;
`;

const StyledCardRow = styled.div`
  align-items: center;
  display: flex;
  height: 36px;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledObjectLink = styled(Link)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  text-decoration: none;
  color: ${({ theme }) => theme.font.color.primary};

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledField = styled.p`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDataRoleOverviewRoles = ({
  data,
}: SettingsDataRoleOverviewObjectProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const [permissionsExpanded, setPermissionsExpanded] = useState(false);
  const permissions = data.permissions ?? '';
  
  const Icon = getIcon(data.icon);
  const IconUser = getIcon("IconUser");

  const roleTypeItem = {
    isCustom: data.isCustom,
    isRemote: data.isRemote,
  };

  const url = `/settings/roles/${data.name}`;
  const navigateTorole = data.isCustom ? `${url}/edit` : `${url}/view`;

  return (
    <StyledNode>
      <StyledHeader>
        <StyledObjectName onMouseEnter={() => {}} onMouseLeave={() => {}}>
          {/* URL test, fix */}
          <StyledObjectLink to={`${navigateTorole}`}>
            {Icon && <Icon size={theme.icon.size.md} />}
            {capitalize(data.name)}
          </StyledObjectLink>

        </StyledObjectName>
        <SettingsRoleTypeTag
          roleTypeLabel={getRoleTypeLabel(roleTypeItem)}
        ></SettingsRoleTypeTag>
      </StyledHeader>

      <StyledInnerCard>
        <StyledCardRow>
            {IconUser && <IconUser size={theme.icon.size.md} />}
            {data?.users?.length}
        </StyledCardRow>
        <Button  title="View Permissions" onClick={() => setPermissionsExpanded((prev) => !prev)} />
        {permissionsExpanded && Array.isArray(permissions) &&
          permissions.length > 0 &&
          permissions.map((permission) => (
            <StyledCardRow key={permission.id}>
                <StyledField>
                    {capitalize(permission.tableName)}: {(() => {
                        const permissions = [
                            permission.canCreate && 'create',
                            permission.canEdit && 'edit',
                            permission.canView && 'view',
                            permission.canDelete && 'delete',
                        ].filter(Boolean); 

                        if (permissions.length === 0) {
                            return 'N/A'; 
                        }

                        if (permissions.length === 1) {
                            return `Can ${permissions[0]}`; 
                        }

                        const lastPermission = permissions.pop(); 
                        return `Can ${permissions.join(', ')} and ${lastPermission}.`; 
                        })()
                    }
                </StyledField>
            </StyledCardRow>
          ))}
      </StyledInnerCard>
    </StyledNode>
  );
};
