// @ts-nocheck
import { relative } from 'node:path'

export const relativeImportPath = (from: string, to: string) => {
  const fromResolved = relative(from, to)
  return fromResolved[0] === '.' ? fromResolved : `./${fromResolved}`
}
