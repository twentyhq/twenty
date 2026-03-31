import { type NonReadableViewFieldInfo } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';
import { getNonReadableViewFieldSubTitle } from '@/object-record/record-index/utils/getNonReadableViewFieldSubTitle';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/layout';

const StyledEmptyPlaceholderOuterContainer = styled.div`
  height: 100%;
  width: 100%;
`;

type RecordIndexEmptyStateNotSharedProps = {
  nonReadableViewFieldInfo?: NonReadableViewFieldInfo;
};

export const RecordIndexEmptyStateNotShared = ({
  nonReadableViewFieldInfo,
}: RecordIndexEmptyStateNotSharedProps) => {
  return (
    <StyledEmptyPlaceholderOuterContainer>
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="notShared" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {isDefined(nonReadableViewFieldInfo)
              ? t`View not shared`
              : t`Object not shared`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {isDefined(nonReadableViewFieldInfo)
              ? getNonReadableViewFieldSubTitle(nonReadableViewFieldInfo)
              : t`You don't have access to this object.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </StyledEmptyPlaceholderOuterContainer>
  );
};
