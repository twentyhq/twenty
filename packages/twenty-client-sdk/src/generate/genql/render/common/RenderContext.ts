// @ts-nocheck
import { GraphQLSchema } from 'graphql'
import { BuiltInParserName } from 'prettier'
import { Config } from '../../config'
import { prettify } from '../../helpers/prettify'
import { relativeImportPath } from './relativeImportPath'

interface Import {
    isDefault: boolean
    module?: string
    alias?: string
}

interface ImportMap {
    [from: string]: Import[]
}

export class RenderContext {
    protected codeBlocks: string[] = []
    protected imports: ImportMap = {}
    protected importAliasCounter = 0

    constructor(public schema?: GraphQLSchema, public config?: Config) {}

    addCodeBlock(block: string) {
        if (block) {
            this.codeBlocks.push(block)
        }
    }

    addImport(
        from: string,
        isDefault: boolean,
        module?: string,
        fromAbsolute?: boolean,
        noAlias?: boolean,
    ) {
        if (this.config && this.config.output) {
            from = fromAbsolute
                ? from
                : relativeImportPath(this.config.output, from)
        }

        if (!this.imports[from]) this.imports[from] = []

        const imports = this.imports[from]

        const existing = imports.find(
            (i) =>
                (isDefault && i.isDefault) ||
                (!isDefault && i.module === module),
        )

        if (existing) return existing.alias

        this.importAliasCounter++
        const alias = noAlias ? undefined : `a${this.importAliasCounter}`
        imports.push({ isDefault, module, alias })

        return alias
    }

    protected getImportBlock() {
        const imports: string[] = []

        Object.keys(this.imports).forEach((from) => {
            let defaultImport = this.imports[from].find((i) => i.isDefault)
            const namedImports = this.imports[from].filter((i) => !i.isDefault)
            const statements: string[] = []

            if (defaultImport) {
                statements.push(defaultImport.alias || '')
            }

            if (namedImports.length > 0) {
                statements.push(
                    `{${namedImports
                        .map((i) =>
                            i.alias ? `${i.module} as ${i.alias}` : i.module,
                        )
                        .join(',')}}`,
                )
            }

            imports.push(`import ${statements.join(',')} from '${from}'`)
        })

        if (imports.length > 0) return imports.join('\n')
        else return
    }

    async toCode(parser?: BuiltInParserName, pretty = false) {
        const blocks = [...this.codeBlocks]

        if (parser && (parser === 'typescript' || parser === 'babel')) {
            const importBlock = this.getImportBlock()
            if (importBlock) blocks.unshift(importBlock)
        }
        if (parser && pretty) {
            return prettify(blocks.join('\n\n'), parser)
        }
        if (parser) {
            return blocks.join('\n\n')
        }
        return blocks.join('')
    }
}
