import { Injectable } from '@nestjs/common';
import { Parser } from 'expr-eval';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class FieldCalculationService {
  private readonly parser = new Parser();

  public evaluate(formula: string, fields: Record<string, any>): number {
    try {
      const expr = this.parser.parse(formula);
      return expr.evaluate(fields);
    } catch (error) {
      throw new Error(`Failed to evaluate formula "${formula}": ${error.message}`);
    }
  }

  public getCalculatedFields(fields: FlatFieldMetadata[]): FlatFieldMetadata[] {
    return fields.filter(
      (field) =>
        field.type === FieldMetadataType.NUMBER &&
        isDefined(field.settings?.calculationFormula),
    );
  }

  public buildDependencyGraph(calculatedFields: FlatFieldMetadata[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const field of calculatedFields) {
      const formula = field.settings?.calculationFormula;
      if (formula) {
        try {
          const dependencies = this.parser.parse(formula).variables();
          graph.set(field.name, dependencies);
        } catch {
          graph.set(field.name, []);
        }
      }
    }

    return graph;
  }

  public sortFieldsByDependency(calculatedFields: FlatFieldMetadata[]): FlatFieldMetadata[] {
    const graph = this.buildDependencyGraph(calculatedFields);
    const sortedNames: string[] = [];
    const visited = new Set<string>();
    const processing = new Set<string>();

    const visit = (name: string) => {
      if (processing.has(name)) {
        throw new Error(`Circular dependency detected involving field "${name}"`);
      }
      if (!visited.has(name)) {
        processing.add(name);
        const dependencies = graph.get(name) || [];
        for (const dep of dependencies) {
          if (graph.has(dep)) {
            visit(dep);
          }
        }
        processing.delete(name);
        visited.add(name);
        sortedNames.push(name);
      }
    };

    for (const field of calculatedFields) {
      visit(field.name);
    }

    return sortedNames.map((name) => 
      calculatedFields.find((f) => f.name === name)!
    );
  }
}
