# Sandbox image for the DOCKER code-interpreter driver.
#
# Published as twentycrm/sandbox:<tag>. The driver runs user-authored Python
# snippets inside instances of this image, bind-mounted to a host work dir
# for file I/O. Bake sandbox-scripts in so the driver does not have to copy
# them per-run.
#
# Build from the twenty-server package root so the COPY path resolves:
#   cd packages/twenty-server
#   docker build \
#     -t twentycrm/sandbox:dev \
#     -f ../twenty-docker/sandbox/Dockerfile \
#     src/engine/core-modules/code-interpreter

FROM python:3.12-slim

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System libs needed by pillow / matplotlib / PDF / image handling.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libjpeg62-turbo \
        libpng16-16 \
        libfreetype6 \
        libopenjp2-7 \
        libtiff6 \
        zlib1g \
        fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Match the library set the E2B sandbox exposes so the pre-seeded
# sandbox-scripts (docx/pdf/pptx/xlsx helpers) and typical user code work
# out of the box.
RUN pip install \
        "numpy~=2.2" \
        "pandas~=2.2" \
        "matplotlib~=3.9" \
        "pillow~=11.0" \
        "openpyxl~=3.1" \
        "python-docx~=1.1" \
        "python-pptx~=1.0" \
        "pypdf~=5.0" \
        "pdfplumber~=0.11" \
        "reportlab~=4.2" \
        "requests~=2.32"

# Create the home directory before any overlay (bind mount) takes it over;
# necessary so the directory exists in the rootfs with the right owner for
# cases where no bind mount is supplied.
RUN useradd --uid 1000 --create-home --home-dir /home/user user

# Pre-seed the office-document helpers. Copied from twenty-server's
# code-interpreter module (see build command above).
COPY --chown=user:user sandbox-scripts/ /home/user/scripts/

USER user
WORKDIR /home/user
