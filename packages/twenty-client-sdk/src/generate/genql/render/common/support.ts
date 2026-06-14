// @ts-nocheck
export function sortKeys(obj: Record<any, any>): Record<any, any> {
    obj = obj || {}
    const ordered = {}
    Object.keys(obj)
        .sort()
        // .reverse()
        .forEach(function(key) {
            ordered[key] = obj[key]
        })
    return ordered
}

export function intersection<T>(a: T[][]): T[] {
    return a.reduce((p, c) => p.filter((e) => c.includes(e)))
}
