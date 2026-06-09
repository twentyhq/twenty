// @ts-nocheck
import prettier from 'prettier/standalone'
import { BuiltInParserName } from 'prettier'
import parserGraphql from 'prettier/parser-graphql'
import parserTS from 'prettier/parser-typescript'

export const prettify = (code: string, parser?: BuiltInParserName): string => {
    // return code
    return prettier.format(code, {
        parser,
        plugins: [parserGraphql, parserTS],
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        printWidth: 80,
    })
}
