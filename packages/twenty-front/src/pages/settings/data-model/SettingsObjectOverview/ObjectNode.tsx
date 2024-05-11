import { useNavigate } from 'react-router-dom';
import { Handle, NodeProps, Position } from 'reactflow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconArchive,
  IconBox,
  IconPencil,
  IconSettings,
  IconTag,
  useIcons,
} from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { capitalize } from '~/utils/string/capitalize';

import '@reactflow/node-resizer/dist/style.css';

type ObjectNodeProps = NodeProps<ObjectMetadataItem>;

const StyledObjectNode = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  width: 200px;
  padding: ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
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
  font-weight: bold;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 8px;
  position: relative;
  text-align: center;
`;

const StyledInnerCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)}
    ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2.5)};
  display: flex;
  flex-flow: column nowrap;
  gap: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledCardRow = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCardRowText = styled.div``;

const StyledObjectInstanceCount = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const ObjectNode = ({ data }: ObjectNodeProps) => {
  const dropdownId = `settings-object-overview-action-dropdown-${data.namePlural}`;
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { closeDropdown } = useDropdown(dropdownId);
  const navigate = useNavigate();

  const { totalCount } = useFindManyRecords({
    objectNameSingular: data.nameSingular,
  });

  const Icon = getIcon(data.icon);

  const handleEdit = () => {
    navigate('/settings/objects/' + data.namePlural);
    closeDropdown();
  };

  return (
    <StyledObjectNode>
      <StyledHeader>
        <StyledObjectName onMouseEnter={() => {}} onMouseLeave={() => {}}>
          {Icon && <Icon size={theme.icon.size.md} />}
          {capitalize(data.namePlural)}
          <StyledObjectInstanceCount> · {totalCount}</StyledObjectInstanceCount>
        </StyledObjectName>

        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <LightIconButton
              aria-label="Object Options"
              Icon={IconSettings}
              accent="tertiary"
            />
          }
          dropdownComponents={
            <DropdownMenu width="160px">
              <DropdownMenuItemsContainer>
                <MenuItem
                  text="Edit"
                  LeftIcon={IconPencil}
                  onClick={handleEdit}
                />
              </DropdownMenuItemsContainer>
            </DropdownMenu>
          }
          dropdownHotkeyScope={{
            scope: dropdownId,
          }}
        />
      </StyledHeader>

      <StyledInnerCard>
        <StyledCardRow>
          <IconBox size={theme.icon.size.md} />
          <StyledCardRowText>
            <SettingsDataModelObjectTypeTag
              objectTypeLabel={getObjectTypeLabel(data)}
            ></SettingsDataModelObjectTypeTag>
          </StyledCardRowText>
        </StyledCardRow>
        <StyledCardRow>
          <IconTag size={theme.icon.size.md} />
          <StyledCardRowText>{data.fields.length} fields</StyledCardRowText>
        </StyledCardRow>
      </StyledInnerCard>
      <Handle
        type="target"
        position={Position.Right}
        className="right-handle"
        id={data.namePlural + '-target-right'}
      ></Handle>
      <Handle
        type="target"
        className="left-handle"
        position={Position.Left}
        id={data.namePlural + '-target-left'}
      ></Handle>
      <Handle
        type="target"
        className="top-handle"
        position={Position.Top}
        id={data.namePlural + '-target-top'}
      ></Handle>
      <Handle
        type="target"
        className="bottom-handle"
        position={Position.Bottom}
        id={data.namePlural + '-target-bottom'}
      ></Handle>
      <Handle
        type="source"
        className="right-handle"
        position={Position.Right}
        id={data.namePlural + '-source-right'}
      ></Handle>
      <Handle
        type="source"
        className="left-handle"
        position={Position.Left}
        id={data.namePlural + '-source-left'}
      ></Handle>
      <Handle
        type="source"
        className="top-handle"
        position={Position.Top}
        id={data.namePlural + '-source-top'}
      ></Handle>
      <Handle
        type="source"
        className="bottom-handle"
        position={Position.Bottom}
        id={data.namePlural + '-source-bottom'}
      ></Handle>
    </StyledObjectNode>
  );
};
