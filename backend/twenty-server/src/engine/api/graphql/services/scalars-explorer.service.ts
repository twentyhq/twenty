import { Injectable } from '@nestjs/common';

import {
  type GraphQLScalarType,
  type GraphQLSchema,
  isScalarType,
} from 'graphql';

import { scalars } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@Injectable()
export class ScalarsExplorerService {
  private scalarImplementations: Record<string, GraphQLScalarType>;

  constructor() {
    this.scalarImplementations = scalars.reduce((acc, scalar) => {
      // @ts-expect-error legacy noImplicitAny
      acc[scalar.name] = scalar;

      return acc;
    }, {});
  }

  getScalarImplementation(scalarName: string): GraphQLScalarType | undefined {
    return this.scalarImplementations[scalarName];
  }

  getUsedScalarNames(schema: GraphQLSchema): string[] {
    const typeMap = schema.getTypeMap();
    const usedScalarNames: string[] = [];

    for (const typeName in typeMap) {
      const type = typeMap[typeName];

      if (isScalarType(type) && !typeName.startsWith('__')) {
        usedScalarNames.push(type.name);
      }
    }

    return usedScalarNames;
  }

  getScalarResolvers(
    usedScalarNames: string[],
  ): Record<string, GraphQLScalarType> {
    const scalarResolvers: Record<string, GraphQLScalarType> = {};

    for (const scalarName of usedScalarNames) {
      const scalarImplementation = this.getScalarImplementation(scalarName);

      if (scalarImplementation) {
        scalarResolvers[scalarName] = scalarImplementation;
      }
    }

    return scalarResolvers;
  }
}
