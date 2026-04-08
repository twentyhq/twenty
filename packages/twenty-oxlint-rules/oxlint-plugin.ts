import { definePlugin } from '@oxlint/plugins';

import {
  rule as componentPropsNaming,
  RULE_NAME as componentPropsNamingName,
} from './rules/component-props-naming';
import {
  rule as effectComponents,
  RULE_NAME as effectComponentsName,
} from './rules/effect-components';
import {
  rule as enforceModuleBoundaries,
  RULE_NAME as enforceModuleBoundariesName,
} from './rules/enforce-module-boundaries';
import {
  rule as folderStructure,
  RULE_NAME as folderStructureName,
} from './rules/folder-structure';
import {
  rule as graphqlResolversShouldBeGuarded,
  RULE_NAME as graphqlResolversShouldBeGuardedName,
} from './rules/graphql-resolvers-should-be-guarded';
import {
  rule as injectWorkspaceRepository,
  RULE_NAME as injectWorkspaceRepositoryName,
} from './rules/inject-workspace-repository';
import {
  rule as matchingStateVariable,
  RULE_NAME as matchingStateVariableName,
} from './rules/matching-state-variable';
import {
  rule as maxConstsPerFile,
  RULE_NAME as maxConstsPerFileName,
} from './rules/max-consts-per-file';
import {
  rule as noDirectAtomFamilyInSelector,
  RULE_NAME as noDirectAtomFamilyInSelectorName,
} from './rules/no-direct-atom-family-in-selector';
import {
  rule as noHardcodedColors,
  RULE_NAME as noHardcodedColorsName,
} from './rules/no-hardcoded-colors';
import {
  rule as noJotaiStoreInSelector,
  RULE_NAME as noJotaiStoreInSelectorName,
} from './rules/no-jotai-store-in-selector';
import {
  rule as noNavigatePreferLink,
  RULE_NAME as noNavigatePreferLinkName,
} from './rules/no-navigate-prefer-link';
import {
  rule as noStateUseref,
  RULE_NAME as noStateUserefName,
} from './rules/no-state-useref';
import {
  rule as restApiMethodsShouldBeGuarded,
  RULE_NAME as restApiMethodsShouldBeGuardedName,
} from './rules/rest-api-methods-should-be-guarded';
import {
  rule as sortCssPropertiesAlphabetically,
  RULE_NAME as sortCssPropertiesAlphabeticallyName,
} from './rules/sort-css-properties-alphabetically';
import {
  rule as styledComponentsPrefixedWithStyled,
  RULE_NAME as styledComponentsPrefixedWithStyledName,
} from './rules/styled-components-prefixed-with-styled';
import {
  rule as upgradeCommandFilename,
  RULE_NAME as upgradeCommandFilenameName,
} from './rules/upgrade-command-filename';

export default definePlugin({
  meta: { name: 'twenty' },
  rules: {
    [componentPropsNamingName]: componentPropsNaming,
    [effectComponentsName]: effectComponents,
    [enforceModuleBoundariesName]: enforceModuleBoundaries,
    [folderStructureName]: folderStructure,
    [graphqlResolversShouldBeGuardedName]: graphqlResolversShouldBeGuarded,
    [injectWorkspaceRepositoryName]: injectWorkspaceRepository,
    [matchingStateVariableName]: matchingStateVariable,
    [maxConstsPerFileName]: maxConstsPerFile,
    [noDirectAtomFamilyInSelectorName]: noDirectAtomFamilyInSelector,
    [noHardcodedColorsName]: noHardcodedColors,
    [noJotaiStoreInSelectorName]: noJotaiStoreInSelector,
    [noNavigatePreferLinkName]: noNavigatePreferLink,
    [noStateUserefName]: noStateUseref,
    [restApiMethodsShouldBeGuardedName]: restApiMethodsShouldBeGuarded,
    [sortCssPropertiesAlphabeticallyName]: sortCssPropertiesAlphabetically,
    [styledComponentsPrefixedWithStyledName]:
      styledComponentsPrefixedWithStyled,
    [upgradeCommandFilenameName]: upgradeCommandFilename,
  },
});
