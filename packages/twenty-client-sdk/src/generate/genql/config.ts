export const RUNTIME_LIB_NAME = './runtime'

export interface Config {
    verbose?: boolean
    endpoint?: string
    useGet?: boolean
    // the schema string
    schema?: string
    // the output dir
    output?: string
    // options?: Options
    headers?: Record<string, string>
    scalarTypes?: { [k: string]: string }
    // import fetch from a package
    fetchImport?: string
    sortProperties?: boolean
}
