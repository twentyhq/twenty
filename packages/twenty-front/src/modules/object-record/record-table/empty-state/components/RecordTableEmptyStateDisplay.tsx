import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  type AnimatedPlaceholderType,
} from 'twenty-ui/layout';

const StyledEmptyPlaceholderOuterContainer = styled(
  AnimatedPlaceholderEmptyContainer,
)`
  align-items: flex-start;
`;

const StyledEmptyPlaceholderInnerContainer = styled(
  AnimatedPlaceholderEmptyContainer,
)<{ width?: number }>`
  width: ${({ width }) => (isDefined(width) ? `${width}px` : '100%')};
`;

type RecordTableEmptyStateDisplayButtonComponentProps = {
  buttonComponent?: React.ReactNode;
};

type RecordTableEmptyStateDisplayButtonProps = {
  ButtonIcon: IconComponent;
  buttonTitle: string;
  onClick: () => void;
  buttonIsDisabled?: boolean;
};

type RecordTableEmptyStateDisplayProps = {
  animatedPlaceholderType: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
} & (
  | RecordTableEmptyStateDisplayButtonComponentProps
  | RecordTableEmptyStateDisplayButtonProps
);

export const RecordTableEmptyStateDisplay = (
  props: RecordTableEmptyStateDisplayProps,
) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const isReadOnly = isObjectMetadataReadOnly({
    objectPermissions,
    objectMetadataItem,
  });

  const hasAnySoftDeleteFilterOnView = useRecoilComponentValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const scrollWrapperWidth = scrollWrapperHTMLElement?.clientWidth;

  return (
    <StyledEmptyPlaceholderOuterContainer>
      <StyledEmptyPlaceholderInnerContainer width={scrollWrapperWidth}>
        <AnimatedPlaceholder type={props.animatedPlaceholderType} />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {props.title}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {props.subTitle}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        {'buttonComponent' in props && props.buttonComponent}
        {'buttonTitle' in props &&
          !isReadOnly &&
          !hasAnySoftDeleteFilterOnView && (
            <Button
              Icon={props.ButtonIcon}
              title={props.buttonTitle}
              variant="secondary"
              onClick={props.onClick}
              disabled={props.buttonIsDisabled}
            />
          )}
      </StyledEmptyPlaceholderInnerContainer>
    </StyledEmptyPlaceholderOuterContainer>
  );
};
