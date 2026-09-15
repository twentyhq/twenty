// @ts-nocheck
import prettier from 'prettier/standalone'
import { BuiltInParserName } from 'prettier'
import * as parserGraphql from 'prettier/plugins/graphql'
import * as parserTS from 'prettier/plugins/typescript'
import * as parserEstree from 'prettier/plugins/estree'

// Prettier 3 split the estree printer out of the TS parser and made format()
// async. Without prettier/plugins/estree the standalone bundle throws
// "Couldn't find plugin for AST format estree", which crashed the server-side
// GqlTypeGenerator during app sync. Formatting is best-effort cosmetic, so we
// fall back to the unformatted (still valid) code rather than ever throwing.
export const prettify = async (
    code: string,
    parser?: BuiltInParserName,
): Promise<string> => {
    try {
        return await prettier.format(code, {
            parser,
            plugins: [parserGraphql, parserTS, parserEstree],
            semi: false,
            singleQuote: true,
            trailingComma: 'all',
            printWidth: 80,
        })
    } catch {
        return code
    }
}
