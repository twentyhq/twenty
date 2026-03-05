import { styled } from '@linaria/react';

export const SETTINGS_OBJECT_TABLE_COLUMN_WIDTH = '98.7px';

export const StyledObjectTableRowContainer = styled.div`
  > * {
    grid-template-columns: 180px ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} 36px;
  }
`;
