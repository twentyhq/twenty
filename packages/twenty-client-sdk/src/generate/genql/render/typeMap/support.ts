// @ts-nocheck
export function isEmpty(x) {
    if (!x) {
        return true
    }
    return Object.keys(x).length === 0
}
