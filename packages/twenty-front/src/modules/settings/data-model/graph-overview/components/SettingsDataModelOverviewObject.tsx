import { useContext, useState } from 'react';
import { styled } from '@linaria/react';
import { type Node, type NodeProps } from '@xyflow/react';
import { Link } from 'react-router-dom';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectFieldRow } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewField';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { ObjectFieldRowWithoutRelation } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverviewFieldWithoutRelation';
import '@xyflow/react/dist/style.css';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined, getSettingsPath } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronUp, useIcons } from 'twenty-ui/display';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsDataModelOverviewObjectNode = Node<ObjectMetadataItem, 'object'>;
type SettingsDataModelOverviewObjectProps =
  NodeProps<SettingsDataModelOverviewObjectNode>;

const StyledNode = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: ${themeCssVariables.spacing[2]};
  gap: ${themeCssVariables.spacing[2]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  box-shadow: ${themeCssVariables.boxShadow.light};
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
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  position: relative;
  text-align: center;
`;

const StyledInnerCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  background-color: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[2]} 0;
  display: flex;
  flex-flow: column nowrap;
  gap: ${themeCssVariables.spacing['0.5']};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledCardRow = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCardRowOther = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[2]};
  gap: ${themeCssVariables.spacing[2]};

  &:hover {
    background-color: ${themeCssVariables.background.tertiary};
  }
`;

const StyledCardRowText = styled.div``;

const StyledObjectInstanceCount = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledObjectLinkContainer = styled.div`
  > a {
    align-items: center;
    display: flex;
    gap: ${themeCssVariables.spacing[1]};
    text-decoration: none;
    color: ${themeCssVariables.font.color.primary};

    &:hover {
      color: ${themeCssVariables.font.color.secondary};
    }
  }
`;

export const SettingsDataModelOverviewObject = ({
  data: objectMetadataItem,
}: SettingsDataModelOverviewObjectProps) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const [otherFieldsExpanded, setOtherFieldsExpanded] = useState(false);

  const { totalCount } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const fields = objectMetadataItem.fields.filter(
    (x) => !isHiddenSystemField(x) && x.isActive,
  );

  const countNonRelation = fields.filter(
    (x) => x.type !== FieldMetadataType.RELATION,
  ).length;

  const Icon = getIcon(objectMetadataItem.icon);

  return (
    <StyledNode>
      <StyledHeader>
        <StyledObjectName onMouseEnter={() => {}} onMouseLeave={() => {}}>
          <StyledObjectLinkContainer>
            <Link
              to={getSettingsPath(SettingsPath.Objects, {
                objectNamePlural: objectMetadataItem.namePlural,
              })}
            >
              {isDefined(Icon) && <Icon size={theme.icon.size.md} />}
              {objectMetadataItem.labelPlural}
            </Link>
          </StyledObjectLinkContainer>
          <StyledObjectInstanceCount> · {totalCount}</StyledObjectInstanceCount>
        </StyledObjectName>
        <SettingsItemTypeTag item={objectMetadataItem} />
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
