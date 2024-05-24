import styled from '@emotion/styled';
import { Icon123, IconChevronDown, useIcons } from 'twenty-ui';

import {
  EventDescriptionCommonProps,
  StyledButtonContainer,
  StyledItemAction,
  StyledItemAuthorText,
  StyledItemLabelIdentifier,
} from '@/activities/timelineActivities/components/descriptions/types/EventDescriptionCommon';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { IconButton } from '@/ui/input/button/components/IconButton';

type EventDescriptionProps = EventDescriptionCommonProps;

const StyledMainObjectIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 14px;
  width: 14px;
`;

const StyledDiffContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const renderUpdateDescription = (
  labelIdentifierValue: string,
  diff: Record<string, { before: any; after: any }>,
  mainObjectMetadataItem: ObjectMetadataItem,
  getIcon: (iconName: string) => React.ComponentType,
) => {
  const diffKeys = Object.keys(diff);

  if (diffKeys.length === 0) {
    return `updated ${labelIdentifierValue}`;
  }

  if (diffKeys.length === 1) {
    const key = diffKeys[0];
    const field = mainObjectMetadataItem.fields.find(
      (field: any) => field.name === key,
    );

    const IconComponent = field?.icon ? getIcon(field?.icon) : Icon123;

    return (
      <>
        <span>updated</span>
        <StyledMainObjectIconContainer>
          <IconComponent />
        </StyledMainObjectIconContainer>
        <span>{field?.label}</span>
      </>
    );
  }

  if (diffKeys.length > 1) {
    return `updated ${diffKeys.length} fields on ${labelIdentifierValue}`;
  }
};

export const EventDescription = ({
  authorFullName,
  labelIdentifierValue,
  event,
  mainObjectMetadataItem,
}: EventDescriptionProps) => {
  const diff: Record<string, { before: any; after: any }> =
    event.properties?.diff;
  const { getIcon } = useIcons();

  const [, eventAction] = event.name.split('.');

  switch (eventAction) {
    case 'created': {
      return (
        <>
          <StyledItemLabelIdentifier>
            {labelIdentifierValue}
          </StyledItemLabelIdentifier>
          <StyledItemAction>was created by</StyledItemAction>
          <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
        </>
      );
    }
    case 'updated': {
      return (
        <>
          <StyledItemAuthorText>{authorFullName}</StyledItemAuthorText>
          <StyledItemAction>
            {renderUpdateDescription(
              labelIdentifierValue,
              diff,
              mainObjectMetadataItem,
              getIcon,
            )}
            <StyledButtonContainer>
              <IconButton
                Icon={IconChevronDown}
                onClick={() => null}
                size="small"
                variant="secondary"
              />
            </StyledButtonContainer>
          </StyledItemAction>
        </>
      );
    }
    default:
      return null;
  }
};
