import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { stringifyWithoutKeyQuote } from 'src/engine/api/graphql/workspace-query-builder/utils/stringify-without-key-quote.util';

import { ArgsAliasFactory } from './args-alias.factory';

@Injectable()
export class ArgsStringFactory {
  constructor(private readonly argsAliasFactory: ArgsAliasFactory) {}

  create(
    initialArgs: Record<string, any> | undefined,
    fieldMetadataCollection: FieldMetadataInterface[],
    softDeletable?: boolean,
  ): string | null {
    if (!initialArgs) {
      return null;
    }
    if (softDeletable) {
      initialArgs.filter = {
        deletedAt: { is: 'NULL' },
        ...initialArgs.filter,
      };
    }
    let argsString = '';
    const computedArgs = this.argsAliasFactory.create(
      initialArgs,
      fieldMetadataCollection,
    );

    for (const key in computedArgs) {
      // Check if the value is not undefined
      if (computedArgs[key] === undefined) {
        continue;
      }

      if (typeof computedArgs[key] === 'string') {
        // If it's a string, add quotes
        argsString += `${key}: "${computedArgs[key]}", `;
      } else if (
        typeof computedArgs[key] === 'object' &&
        computedArgs[key] !== null
      ) {
        if (key === 'orderBy') {
          argsString += `${key}: ${this.buildStringifiedOrderBy(
            computedArgs[key],
          )}, `;
        } else {
          // If it's an object (and not null), stringify it
          argsString += `${key}: ${stringifyWithoutKeyQuote(
            computedArgs[key],
          )}, `;
        }
      } else {
        // For other types (number, boolean), add as is
        argsString += `${key}: ${computedArgs[key]}, `;
      }
    }

    // Remove trailing comma and space, if present
    if (argsString.endsWith(', ')) {
      argsString = argsString.slice(0, -2);
    }

    return argsString;
  }

  private buildStringifiedOrderBy(
    keyValuePairArray: Array<Record<string, any>>,
  ): string {
    if (
      keyValuePairArray.length !== 0 &&
      Object.keys(keyValuePairArray[0]).length === 0
    ) {
      return `[]`;
    }
    // if position argument is present we want to put it at the very last
    let orderByString = keyValuePairArray
      .sort((_, obj) => (Object.hasOwnProperty.call(obj, 'position') ? -1 : 0))
      .map((obj) => {
        const [key] = Object.keys(obj);
        const value = obj[key];

        return `{${key}: ${value}}`;
      })
      .join(', ');

    if (orderByString.endsWith(', ')) {
      orderByString = orderByString.slice(0, -2);
    }

    return `[${orderByString}]`;
  }
}
