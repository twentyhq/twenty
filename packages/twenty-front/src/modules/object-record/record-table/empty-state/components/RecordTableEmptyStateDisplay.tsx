import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRecordTableCreateDisabled } from '@/object-record/record-table/utils/isRecordTableCreateDisabled';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
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

const StyledEmptyPlaceholderOuterContainer = styled.div`
  height: 100%;
  width: 100%;
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
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isReadOnly =
    isLayoutCustomizationModeEnabled ||
    isObjectMetadataReadOnly({
      objectPermissions,
      objectMetadataItem,
    });

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const { scrollWrapperHTMLElement } = useScrollWrapperHTMLElement();

  const scrollWrapperWidth = scrollWrapperHTMLElement?.clientWidth;

  return (
    <StyledEmptyPlaceholderOuterContainer>
      <AnimatedPlaceholderEmptyContainer width={scrollWrapperWidth}>
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
          !hasAnySoftDeleteFilterOnView &&
          !isRecordTableCreateDisabled(objectMetadataItem) && (
            <Button
              Icon={props.ButtonIcon}
              title={props.buttonTitle}
              variant="secondary"
              onClick={props.onClick}
              disabled={props.buttonIsDisabled}
            />
          )}
      </AnimatedPlaceholderEmptyContainer>
    </StyledEmptyPlaceholderOuterContainer>
  );
};
