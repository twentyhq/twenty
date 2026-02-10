import {
  rule as linguiNoExpressionInMessage,
  name as linguiNoExpressionInMessageName,
} from 'eslint-plugin-lingui/lib/rules/no-expression-in-message';
import {
  rule as linguiNoSingleTagToTranslate,
  name as linguiNoSingleTagToTranslateName,
} from 'eslint-plugin-lingui/lib/rules/no-single-tag-to-translate';
import {
  rule as linguiNoSingleVariablesToTranslate,
  name as linguiNoSingleVariablesToTranslateName,
} from 'eslint-plugin-lingui/lib/rules/no-single-variables-to-translate';
import {
  rule as linguiNoTransInsideTrans,
  name as linguiNoTransInsideTransName,
} from 'eslint-plugin-lingui/lib/rules/no-trans-inside-trans';
import {
  rule as linguiNoUnlocalizedStrings,
  name as linguiNoUnlocalizedStringsName,
} from 'eslint-plugin-lingui/lib/rules/no-unlocalized-strings';
import {
  rule as linguiTCallInFunction,
  name as linguiTCallInFunctionName,
} from 'eslint-plugin-lingui/lib/rules/t-call-in-function';

import { rules as preferArrowFunctionsRules } from 'eslint-plugin-prefer-arrow-functions';
import {
  rule as componentPropsNaming,
  RULE_NAME as componentPropsNamingName,
} from './rules/component-props-naming';
import {
  rule as constantsUpperCase,
  RULE_NAME as constantsUpperCaseName,
} from './rules/constants-upper-case';
import {
  rule as effectComponents,
  RULE_NAME as effectComponentsName,
} from './rules/effect-components';
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
  rule as noHardcodedColors,
  RULE_NAME as noHardcodedColorsName,
} from './rules/no-hardcoded-colors';
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
  rule as styledComponentsPrefixedWithStyled,
  RULE_NAME as styledComponentsPrefixedWithStyledName,
} from './rules/styled-components-prefixed-with-styled';
import {
  rule as useGetLoadableAndGetValueToGetAtoms,
  RULE_NAME as useGetLoadableAndGetValueToGetAtomsName,
} from './rules/use-getLoadable-and-getValue-to-get-atoms';
import {
  rule as useRecoilCallbackHasDependencyArray,
  RULE_NAME as useRecoilCallbackHasDependencyArrayName,
} from './rules/useRecoilCallback-has-dependency-array';

export default {
  meta: { name: 'twenty' },
  rules: {
    [componentPropsNamingName]: componentPropsNaming,
    [effectComponentsName]: effectComponents,
    [matchingStateVariableName]: matchingStateVariable,
    [noHardcodedColorsName]: noHardcodedColors,
    [noStateUserefName]: noStateUseref,
    // prettier-ignore
    [styledComponentsPrefixedWithStyledName]: styledComponentsPrefixedWithStyled,
    // prettier-ignore
    [useGetLoadableAndGetValueToGetAtomsName]: useGetLoadableAndGetValueToGetAtoms,
    // prettier-ignore
    [useRecoilCallbackHasDependencyArrayName]: useRecoilCallbackHasDependencyArray,
    [constantsUpperCaseName]: constantsUpperCase,
    [graphqlResolversShouldBeGuardedName]: graphqlResolversShouldBeGuarded,
    [injectWorkspaceRepositoryName]: injectWorkspaceRepository,
    // prettier-ignore
    ['prefer-arrow-functions']: preferArrowFunctionsRules['prefer-arrow-functions'],
    [maxConstsPerFileName]: maxConstsPerFile,
    [noNavigatePreferLinkName]: noNavigatePreferLink,
    [restApiMethodsShouldBeGuardedName]: restApiMethodsShouldBeGuarded,
    [linguiNoUnlocalizedStringsName]: linguiNoUnlocalizedStrings,
    [linguiTCallInFunctionName]: linguiTCallInFunction,
    [linguiNoSingleTagToTranslateName]: linguiNoSingleTagToTranslate,
    // prettier-ignore
    [linguiNoSingleVariablesToTranslateName]: linguiNoSingleVariablesToTranslate,
    [linguiNoTransInsideTransName]: linguiNoTransInsideTrans,
    [linguiNoExpressionInMessageName]: linguiNoExpressionInMessage,
  },
};
