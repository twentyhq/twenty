import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SearchRecordPreviewCard } from '@/search/components/SearchRecordPreviewCard';
import { SEARCH_RECORD_PREVIEW_WIDTH } from '@/search/constants/SearchRecordPreviewWidth';
import { type SearchResultItem } from '@/search/types/SearchResultItem';

const StyledContainer = styled.aside`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 0;
  width: ${SEARCH_RECORD_PREVIEW_WIDTH}px;
`;

const StyledEmpty = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

type SearchPagePreviewProps = {
  previewedItem: SearchResultItem | null;
};

export const SearchPagePreview = ({
  previewedItem,
}: SearchPagePreviewProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      {isDefined(previewedItem) ? (
        <SearchRecordPreviewCard
          key={previewedItem.recordId}
          objectNameSingular={previewedItem.objectNameSingular}
          recordId={previewedItem.recordId}
          label={previewedItem.label}
          layout="filled"
        />
      ) : (
        <StyledEmpty>{t`Select a result to preview it`}</StyledEmpty>
      )}
    </StyledContainer>
  );
};
