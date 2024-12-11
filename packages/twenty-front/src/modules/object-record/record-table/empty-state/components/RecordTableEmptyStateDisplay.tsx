import { isObjectMetadataReadOnly } from '@/object-metadata/utils/isObjectMetadataReadOnly';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  AnimatedPlaceholderType,
  Button,
  IconComponent,
} from 'twenty-ui';

type RecordTableEmptyStateDisplayProps = {
  animatedPlaceholderType: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
  Icon: IconComponent;
  buttonTitle: string;
  onClick: () => void;
};

export const RecordTableEmptyStateDisplay = ({
  Icon,
  animatedPlaceholderType,
  buttonTitle,
  onClick,
  subTitle,
  title,
}: RecordTableEmptyStateDisplayProps) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const isReadOnly = isObjectMetadataReadOnly(objectMetadataItem);

  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type={animatedPlaceholderType} />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {subTitle}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      {!isReadOnly && (
        <Button
          Icon={Icon}
          title={buttonTitle}
          variant={'secondary'}
          onClick={onClick}
        />
      )}
    </AnimatedPlaceholderEmptyContainer>
  );
};
