import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
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

  return (
    <AnimatedPlaceholderEmptyContainer>
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
      {'buttonTitle' in props && !isReadOnly && (
        <Button
          Icon={props.ButtonIcon}
          title={props.buttonTitle}
          variant="secondary"
          onClick={props.onClick}
          disabled={props.buttonIsDisabled}
        />
      )}
    </AnimatedPlaceholderEmptyContainer>
  );
};
