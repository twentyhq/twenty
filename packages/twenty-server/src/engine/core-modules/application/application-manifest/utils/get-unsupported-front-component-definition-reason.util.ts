import * as typescript from 'typescript';
import { isDefined } from 'twenty-shared/utils';

export const getUnsupportedFrontComponentDefinitionReason = ({
  sourceFile,
  universalIdentifier,
  name,
  description,
  componentName,
}: {
  sourceFile: typescript.SourceFile;
  universalIdentifier: string;
  name: string;
  description: string | null;
  componentName: string;
}): string | undefined => {
  const definition = sourceFile.statements.find(typescript.isExportAssignment);
  if (
    !isDefined(definition) ||
    !typescript.isCallExpression(definition.expression) ||
    !typescript.isIdentifier(definition.expression.expression) ||
    definition.expression.expression.text !== 'defineFrontComponent'
  ) {
    return 'source does not export a standalone defineFrontComponent definition';
  }
  const config = definition.expression.arguments[0];
  if (!isDefined(config) || !typescript.isObjectLiteralExpression(config)) {
    return 'source does not declare a literal front component identifier';
  }
  if (config.properties.some(typescript.isSpreadAssignment)) {
    return 'source contains computed or spread front component metadata';
  }
  const metadataProperties = config.properties.filter(
    (property) => !typescript.isSpreadAssignment(property),
  );
  if (
    metadataProperties.some((property) =>
      typescript.isComputedPropertyName(property.name),
    )
  ) {
    return 'source contains computed or spread front component metadata';
  }
  const identifiers = metadataProperties.filter(
    (property) =>
      typescript.isPropertyAssignment(property) &&
      (typescript.isIdentifier(property.name) ||
        typescript.isStringLiteral(property.name)) &&
      property.name.text === 'universalIdentifier',
  );
  const identifier = identifiers[0];
  if (
    identifiers.length !== 1 ||
    !isDefined(identifier) ||
    !typescript.isPropertyAssignment(identifier) ||
    !typescript.isStringLiteral(identifier.initializer) ||
    identifier.initializer.text.toLowerCase() !==
      universalIdentifier.toLowerCase()
  ) {
    return 'source does not declare the stored front component identifier';
  }
  for (const { key, storedValue, defaultValue } of [
    { key: 'name', storedValue: name, defaultValue: componentName },
    { key: 'description', storedValue: description, defaultValue: null },
  ]) {
    const properties = metadataProperties.filter(
      (property) =>
        (typescript.isIdentifier(property.name) ||
          typescript.isStringLiteral(property.name)) &&
        property.name.text === key,
    );
    const property = properties[0];
    let sourceValue = defaultValue;
    if (properties.length > 1) {
      return `source contains duplicate front component ${key}`;
    }
    if (isDefined(property)) {
      if (!typescript.isPropertyAssignment(property)) {
        return `source front component ${key} cannot be statically verified`;
      }
      const value = property.initializer;
      if (typescript.isStringLiteralLike(value)) {
        sourceValue = value.text;
      } else if (
        value.kind !== typescript.SyntaxKind.NullKeyword &&
        !(typescript.isIdentifier(value) && value.text === 'undefined')
      ) {
        return `source front component ${key} cannot be statically verified`;
      }
    }
    if (sourceValue !== storedValue) {
      return `source front component ${key} does not match stored metadata`;
    }
  }
  return undefined;
};
