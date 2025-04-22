import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Node, NodeProps } from '@xyflow/react';
import { Link } from 'react-router-dom';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectFieldRow } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewField';
import { SettingsDataModelObjectTypeTag } from '@/settings/data-model/objects/components/SettingsDataModelObjectTypeTag';
import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { FieldMetadataType } from '~/generated/graphql';

import { ObjectFieldRowWithoutRelation } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewFieldWithoutRelation';
import { SettingsPath } from '@/types/SettingsPath';
import '@xyflow/react/dist/style.css';
import { useState } from 'react';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { capitalize } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronUp, useIcons } from 'twenty-ui/display';

type SettingsDataModelOverviewObjectNode = Node<ObjectMetadataItem, 'object'>;
type SettingsDataModelOverviewObjectProps =
  NodeProps<SettingsDataModelOverviewObjectNode>;

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
`;

const StyledCardRow = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCardRowOther = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 24px;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledCardRowText = styled.div``;

const StyledObjectInstanceCount = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
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

export const SettingsDataModelOverviewObject = ({
  data: objectMetadataItem,
}: SettingsDataModelOverviewObjectProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const [otherFieldsExpanded, setOtherFieldsExpanded] = useState(false);

  const { totalCount } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const fields = objectMetadataItem.fields.filter(
    (x) => !x.isSystem && x.isActive,
  );

  const countNonRelation = fields.filter(
    (x) => x.type !== FieldMetadataType.RELATION,
  ).length;

  const Icon = getIcon(objectMetadataItem.icon);

  return (
    <StyledNode>
      <StyledHeader>
        <StyledObjectName onMouseEnter={() => {}} onMouseLeave={() => {}}>
          <StyledObjectLink
            to={getSettingsPath(SettingsPath.Objects, {
              objectNamePlural: objectMetadataItem.namePlural,
            })}
          >
            {Icon && <Icon size={theme.icon.size.md} />}
            {capitalize(objectMetadataItem.namePlural)}
          </StyledObjectLink>
          <StyledObjectInstanceCount> · {totalCount}</StyledObjectInstanceCount>
        </StyledObjectName>
        <SettingsDataModelObjectTypeTag
          objectTypeLabel={getObjectTypeLabel(objectMetadataItem)}
        ></SettingsDataModelObjectTypeTag>
      </StyledHeader>

      <StyledInnerCard>
        {fields
          .filter((x) => x.type === FieldMetadataType.RELATION)
          .map((field) => (
            <StyledCardRow key={field.id}>
              <ObjectFieldRow field={field} />
            </StyledCardRow>
          ))}
        {countNonRelation > 0 && (
          <>
            <StyledCardRowOther
              onClick={() => setOtherFieldsExpanded(!otherFieldsExpanded)}
            >
              {otherFieldsExpanded ? (
                <IconChevronUp size={theme.icon.size.md} />
              ) : (
                <IconChevronDown size={theme.icon.size.md} />
              )}
              <StyledCardRowText>{countNonRelation} fields</StyledCardRowText>
            </StyledCardRowOther>
            {otherFieldsExpanded &&
              fields
                .filter((x) => x.type !== FieldMetadataType.RELATION)
                .map((field) => (
                  <StyledCardRow key={field.id}>
                    <ObjectFieldRowWithoutRelation field={field} />
                  </StyledCardRow>
                ))}
          </>
        )}
      </StyledInnerCard>
    </StyledNode>
  );
};
