import { Link } from 'react-router-dom';
import { NodeProps } from 'reactflow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconTag, useIcons } from 'twenty-ui';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { ObjectFieldRow } from '~/pages/settings/data-model/SettingsObjectOverview/ObjectFieldRow';
import { capitalize } from '~/utils/string/capitalize';

import '@reactflow/node-resizer/dist/style.css';

type ObjectNodeProps = NodeProps<ObjectMetadataItem>;

const StyledObjectNode = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  width: 220px;
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
`;

const StyledCardRow = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCardRowOther = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCardRowText = styled.div``;

const StyledObjectInstanceCount = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledObjectLink = styled(Link)`
  align-items: center;
  display: flex;
  text-decoration: none;
  color: ${({ theme }) => theme.font.color.primary};

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

export const ObjectNode = ({ data }: ObjectNodeProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const { totalCount } = useFindManyRecords({
    objectNameSingular: data.nameSingular,
  });

  const countNonRelation = data.fields.filter(
    (x) => !x.toRelationMetadata && !x.fromRelationMetadata,
  ).length;

  const Icon = getIcon(data.icon);

  return (
    <StyledObjectNode>
      <StyledHeader>
        <StyledObjectName onMouseEnter={() => {}} onMouseLeave={() => {}}>
          <StyledObjectLink to={'/settings/objects/' + data.namePlural}>
            {Icon && <Icon size={theme.icon.size.md} />}
            {capitalize(data.namePlural)}
          </StyledObjectLink>
          <StyledObjectInstanceCount> · {totalCount}</StyledObjectInstanceCount>
        </StyledObjectName>
        <SettingsDataModelObjectTypeTag
          objectTypeLabel={getObjectTypeLabel(data)}
        ></SettingsDataModelObjectTypeTag>
      </StyledHeader>

      <StyledInnerCard>
        {data.fields
          .filter((x) => x.toRelationMetadata && !x.isSystem)
          .map((field) => (
            <StyledCardRow>
              <ObjectFieldRow field={field} type="from"></ObjectFieldRow>
            </StyledCardRow>
          ))}
        {data.fields
          .filter((x) => x.fromRelationMetadata && !x.isSystem)
          .map((field) => (
            <StyledCardRow>
              <ObjectFieldRow field={field} type="to"></ObjectFieldRow>
            </StyledCardRow>
          ))}
        {countNonRelation > 0 && (
          <StyledCardRowOther>
            <IconTag size={theme.icon.size.md} />
            <StyledCardRowText>
              {countNonRelation} other fields
            </StyledCardRowText>
          </StyledCardRowOther>
        )}
      </StyledInnerCard>
    </StyledObjectNode>
  );
};
