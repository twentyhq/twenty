## Gradle

- If you import an entire Gradle repository into a subfolder, files like `gradlew`, `gradlew.bat`, and `gradle/wrapper` will end up inside that imported subfolder.
- The `@nx/gradle` plugin expects those files at the workspace root to infer Gradle projects/tasks automatically.
- If the target workspace has no Gradle setup yet, consider moving those files to the root (especially when using `@nx/gradle`).
- If the target workspace already has Gradle configured, avoid duplicate wrappers: remove imported duplicates from the subfolder or merge carefully.
- Because the import lands in a subfolder, Gradle project references can break; review settings and project path references, then fix any errors.
- If `@nx/gradle` is installed, run `nx show projects` to verify that Gradle projects are being inferred.

Helpful docs:

- https://nx.dev/docs/technologies/java/gradle/introduction
