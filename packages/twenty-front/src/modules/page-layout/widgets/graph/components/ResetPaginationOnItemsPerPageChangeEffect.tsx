import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type ResetPaginationOnItemsPerPageChangeEffectProps = {
  itemsPerPage: number;
  onReset: () => void;
};

export const ResetPaginationOnItemsPerPageChangeEffect = ({
  itemsPerPage,
  onReset,
}: ResetPaginationOnItemsPerPageChangeEffectProps) => {
  const [previousItemsPerPage, setPreviousItemsPerPage] =
    useState<number>(itemsPerPage);

  useEffect(() => {
    if (
      isDefined(previousItemsPerPage) &&
      previousItemsPerPage !== itemsPerPage
    ) {
      onReset();
    }
    setPreviousItemsPerPage(itemsPerPage);
  }, [itemsPerPage, onReset, previousItemsPerPage]);

  return null;
};
