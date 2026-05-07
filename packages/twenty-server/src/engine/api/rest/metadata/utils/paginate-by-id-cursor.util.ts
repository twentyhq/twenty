import { BadRequestException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type SelectQueryBuilder } from 'typeorm';

export type RestCursorPageInfo = {
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

export const paginateByIdCursor = async <T extends { id: string }>({
  queryBuilder,
  alias,
  limit,
  startingAfter,
  endingBefore,
}: {
  queryBuilder: SelectQueryBuilder<T>;
  alias: string;
  limit: number;
  startingAfter?: string;
  endingBefore?: string;
}): Promise<{ items: T[]; pageInfo: RestCursorPageInfo }> => {
  if (isDefined(startingAfter) && isDefined(endingBefore)) {
    throw new BadRequestException(
      `'starting_after' and 'ending_before' cannot be used together.`,
    );
  }

  if (isDefined(endingBefore)) {
    const rows = await queryBuilder
      .andWhere(`${alias}.id > :endingBefore`, { endingBefore })
      .orderBy(`${alias}.id`, 'ASC')
      .limit(limit + 1)
      .getMany();

    const hasMore = rows.length > limit;
    const items = (hasMore ? rows.slice(0, limit) : rows).reverse();

    return {
      items,
      pageInfo: {
        hasNextPage: hasMore,
        startCursor: items[0]?.id ?? null,
        endCursor: items[items.length - 1]?.id ?? null,
      },
    };
  }

  if (isDefined(startingAfter)) {
    queryBuilder.andWhere(`${alias}.id < :startingAfter`, { startingAfter });
  }

  const rows = await queryBuilder
    .orderBy(`${alias}.id`, 'DESC')
    .limit(limit + 1)
    .getMany();

  const hasNextPage = rows.length > limit;
  const items = hasNextPage ? rows.slice(0, limit) : rows;

  return {
    items,
    pageInfo: {
      hasNextPage,
      startCursor: items[0]?.id ?? null,
      endCursor: items[items.length - 1]?.id ?? null,
    },
  };
};
