# Quick Fix for Docker Build Failures

## Problem
The Docker builds are failing in GitHub Actions, preventing the image with fixes from being created.

## Solution: Temporarily Disable Multi-Platform Build

### 1. Edit the Workflow
Edit `.github/workflows/github_workflows_docker-build-deploy.yaml`:

Find this section:
```yaml
    - name: Build and push main application image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./packages/twenty-docker/twenty/Dockerfile
        platforms: linux/amd64,linux/arm64  # This is causing the failure
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        build-args: |
          REACT_APP_SERVER_BASE_URL=${{ secrets.SERVER_URL }}
          APP_VERSION=0.0.0-${{ github.sha }}
```

And **remove** the `platforms` line temporarily:

```yaml
    - name: Build and push main application image
      uses: docker/build-push-action@v5
      with:
        context: .
        file: ./packages/twenty-docker/twenty/Dockerfile
        # platforms: linux/amd64,linux/arm64  # Temporarily commented out
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        build-args: |
          REACT_APP_SERVER_BASE_URL=${{ secrets.SERVER_URL }}
          APP_VERSION=0.0.0-${{ github.sha }}
```

### 2. Commit and Push
```bash
git add .github/workflows/github_workflows_docker-build-deploy.yaml
git commit -m "fix(ci): temporarily disable multi-platform build to unblock deployments"
git push origin main
```

### 3. Wait for Build
This should build faster (no cross-platform compilation) and succeed.

### 4. After Build Succeeds
Once you have a working image, you can:
- Test it on Sevalla
- Later re-enable multi-platform with proper configuration

## Alternative: Build Locally for Testing

If you need to test immediately while CI is fixed:

### 1. Build Locally
```bash
cd packages/twenty-docker/twenty
docker build -t flcrmlms-test:local .
```

### 2. Push to GHCR
```bash
# Login to GHCR
echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Tag and push
docker tag flcrmlms-test:local ghcr.io/connorbelez/flcrmlms:test-local
docker push ghcr.io/connorbelez/flcrmlms:test-local
```

### 3. Use Test Tag in Sevalla
```
ghcr.io/connorbelez/flcrmlms:test-local
```

## Debugging the Multi-Platform Build

If you want to keep multi-platform support, the issue might be:

### 1. Timeout
Multi-platform builds can take longer than 60 minutes. Increase timeout:
```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    timeout-minutes: 120  # Increase from 60 to 120
```

### 2. QEMU Setup Issue
The QEMU setup might need adjustment:
```yaml
    - name: Set up QEMU
      uses: docker/setup-qemu-action@v3
      with:
        platforms: linux/amd64,linux/arm64/v8
```

### 3. BuildKit Configuration
Add BuildKit configuration:
```yaml
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
      with:
        platforms: linux/amd64,linux/arm64
        buildkitd-flags: --allow-insecure-entitlement security.insecure
```

## For Your Current Sevalla Issue

The immediate solution is to build without multi-platform support. You can use the AMD64 image on your ARM64 Mac with emulation (slower but functional).

### In Sevalla
1. Use the latest successful image (pre-multi-platform)
2. Set image to: `ghcr.io/connorbelez/flcrmlms:main-616a8e6078`
3. Or use: `ghcr.io/connorbelez/flcrmlms:main-c79ee618e6`
4. These images have the entrypoint fixes but were built before multi-platform changes

### Configure Environment Variables
1. Ensure `PG_DATABASE_URL` is correctly spelled
2. Value should start with `postgres://`
3. After deploying, you should see the improved error messages

## Success Criteria

Once fixed:
1. Docker build completes successfully
2. Image is pushed to GHCR
3. Sevalla deployment shows improved error messages
4. Application connects to database properly